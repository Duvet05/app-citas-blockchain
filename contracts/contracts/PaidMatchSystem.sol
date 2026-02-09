// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProfileNFT.sol";
import "./CupidoBank.sol";

/**
 * @title PaidMatchSystem
 * @dev Replaces MatchSystem with paid likes and match rewards.
 * Like fees are split: 50% to treasury, 50% to liked user's pending rewards.
 * Mutual matches trigger automatic reward from treasury.
 */
contract PaidMatchSystem is Ownable, ReentrancyGuard {
    ProfileNFT public profileNFT;
    CupidoBank public bank;

    // --- Fee Configuration ---
    uint256 public likeFee = 0.01 ether;
    uint256 public matchReward = 0.005 ether;

    // --- Data Structures (mirrors original MatchSystem) ---
    struct Like {
        address liker;
        address liked;
        uint256 timestamp;
    }

    struct Match {
        address user1;
        address user2;
        uint256 timestamp;
        bool isActive;
    }

    mapping(address => mapping(address => bool)) public likes;
    mapping(address => address[]) public userLikes;
    mapping(address => address[]) public receivedLikes;

    Match[] public matches;
    mapping(address => mapping(address => uint256)) public matchIndex;
    mapping(address => uint256[]) public userMatches;

    // --- Economics Tracking ---
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalSpent;

    // --- Events ---
    event LikeGiven(address indexed liker, address indexed liked, uint256 timestamp);
    event MatchCreated(address indexed user1, address indexed user2, uint256 matchId, uint256 timestamp);
    event MatchDeactivated(uint256 indexed matchId);
    event LikeFeePaid(address indexed liker, uint256 bankShare, uint256 userShare);
    event MatchRewardPaid(address indexed user1, address indexed user2, uint256 rewardPerUser);

    // --- Constructor ---
    constructor(
        address _profileNFTAddress,
        address payable _bankAddress
    ) Ownable(msg.sender) {
        profileNFT = ProfileNFT(_profileNFTAddress);
        bank = CupidoBank(_bankAddress);
    }

    // --- Core: Paid Like ---
    function likeProfile(address _liked) external payable nonReentrant {
        require(msg.value >= likeFee, "Insufficient payment");
        require(profileNFT.hasProfile(msg.sender), "You must have a profile");
        require(profileNFT.hasProfile(_liked), "Target user has no profile");
        require(msg.sender != _liked, "Cannot like yourself");
        require(!likes[msg.sender][_liked], "Already liked this profile");

        // Check active profiles
        (, , , , , , bool isActiveLiker) = profileNFT.getProfileByAddress(msg.sender);
        (, , , , , , bool isActiveLiked) = profileNFT.getProfileByAddress(_liked);
        require(isActiveLiker, "Your profile is not active");
        require(isActiveLiked, "Target profile is not active");

        // Record like
        likes[msg.sender][_liked] = true;
        userLikes[msg.sender].push(_liked);
        receivedLikes[_liked].push(msg.sender);
        totalSpent[msg.sender] += msg.value;

        // Fee distribution: 50% to bank treasury, 50% to liked user's rewards
        uint256 bankShare = msg.value / 2;
        uint256 userShare = msg.value - bankShare;

        // Send bank share to treasury
        (bool bankSent, ) = address(bank).call{value: bankShare}("");
        require(bankSent, "Bank transfer failed");

        // Add reward for liked user (claimable from bank)
        bank.addReward(_liked, userShare);
        totalEarned[_liked] += userShare;

        emit LikeGiven(msg.sender, _liked, block.timestamp);
        emit LikeFeePaid(msg.sender, bankShare, userShare);

        // Check mutual match
        if (likes[_liked][msg.sender]) {
            _createMatch(msg.sender, _liked);
        }
    }

    // --- Match Creation (identical logic to original MatchSystem) ---
    function _createMatch(address _user1, address _user2) private {
        // Check if match already exists (offset-by-1 pattern)
        uint256 existingMatchId = matchIndex[_user1][_user2];
        if (existingMatchId > 0 && matches[existingMatchId - 1].isActive) {
            return;
        }

        Match memory newMatch = Match({
            user1: _user1,
            user2: _user2,
            timestamp: block.timestamp,
            isActive: true
        });

        matches.push(newMatch);
        uint256 matchId = matches.length - 1;

        matchIndex[_user1][_user2] = matchId + 1;
        matchIndex[_user2][_user1] = matchId + 1;

        userMatches[_user1].push(matchId);
        userMatches[_user2].push(matchId);

        emit MatchCreated(_user1, _user2, matchId, block.timestamp);

        // Disburse match rewards (try/catch so match succeeds even if bank is empty)
        try bank.sendReward(_user1, matchReward) {
            totalEarned[_user1] += matchReward;
        } catch {}

        try bank.sendReward(_user2, matchReward) {
            totalEarned[_user2] += matchReward;
        } catch {}

        emit MatchRewardPaid(_user1, _user2, matchReward);
    }

    // --- Unmatch ---
    function unmatch(address _otherUser) external {
        uint256 mIndex = matchIndex[msg.sender][_otherUser];
        require(mIndex > 0, "No match exists");

        uint256 actualIndex = mIndex - 1;
        require(matches[actualIndex].isActive, "Match already inactive");

        matches[actualIndex].isActive = false;
        emit MatchDeactivated(actualIndex);
    }

    // --- View Functions ---

    function getUserMatches(address _user) public view returns (Match[] memory) {
        uint256[] memory matchIndices = userMatches[_user];
        Match[] memory userMatchList = new Match[](matchIndices.length);

        for (uint256 i = 0; i < matchIndices.length; i++) {
            userMatchList[i] = matches[matchIndices[i]];
        }

        return userMatchList;
    }

    function getActiveMatches(address _user) public view returns (Match[] memory) {
        uint256[] memory matchIndices = userMatches[_user];

        uint256 activeCount = 0;
        for (uint256 i = 0; i < matchIndices.length; i++) {
            if (matches[matchIndices[i]].isActive) {
                activeCount++;
            }
        }

        Match[] memory activeMatches = new Match[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < matchIndices.length; i++) {
            if (matches[matchIndices[i]].isActive) {
                activeMatches[currentIndex] = matches[matchIndices[i]];
                currentIndex++;
            }
        }

        return activeMatches;
    }

    function isMatch(address _user1, address _user2) public view returns (bool) {
        uint256 mIndex = matchIndex[_user1][_user2];
        if (mIndex == 0) return false;
        return matches[mIndex - 1].isActive;
    }

    function getReceivedLikes() public view returns (address[] memory) {
        return receivedLikes[msg.sender];
    }

    function getSentLikes() public view returns (address[] memory) {
        return userLikes[msg.sender];
    }

    function getTotalMatches() public view returns (uint256) {
        return matches.length;
    }

    // --- Economics View ---
    function getUserEconomics(address _user) external view returns (
        uint256 earned,
        uint256 spent,
        uint256 pending
    ) {
        return (
            totalEarned[_user],
            totalSpent[_user],
            bank.pendingRewards(_user)
        );
    }

    // --- Admin Functions ---
    function setLikeFee(uint256 _fee) external onlyOwner {
        likeFee = _fee;
    }

    function setMatchReward(uint256 _reward) external onlyOwner {
        matchReward = _reward;
    }
}
