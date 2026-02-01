// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProfileNFT.sol";

/**
 * @title MatchSystem (Recognition System)
 * @dev Handles peer-to-peer recognitions (karma NFTs gifted between users)
 * A "like" represents a positive recognition that costs gas (anti-spam)
 * A "match" represents mutual recognition between two users
 */
contract MatchSystem {
    ProfileNFT public profileNFT;

    // Struct to represent a like
    struct Like {
        address liker;
        address liked;
        uint256 timestamp;
    }

    // Struct to represent a match
    struct Match {
        address user1;
        address user2;
        uint256 timestamp;
        bool isActive;
    }

    // Mapping: liker => liked => hasLiked
    mapping(address => mapping(address => bool)) public likes;

    // Mapping: user => array of addresses they liked
    mapping(address => address[]) public userLikes;

    // Mapping: user => array of addresses that liked them
    mapping(address => address[]) public receivedLikes;

    // Array of all matches
    Match[] public matches;

    // Mapping: user1 => user2 => match index (to check if match exists)
    mapping(address => mapping(address => uint256)) public matchIndex;

    // Mapping: user => array of match indices
    mapping(address => uint256[]) public userMatches;

    // Events
    event LikeGiven(address indexed liker, address indexed liked, uint256 timestamp);
    event MatchCreated(address indexed user1, address indexed user2, uint256 matchId, uint256 timestamp);
    event MatchDeactivated(uint256 indexed matchId);

    constructor(address _profileNFTAddress) {
        profileNFT = ProfileNFT(_profileNFTAddress);
    }

    /**
     * @dev Like another user's profile
     */
    function likeProfile(address _liked) public {
        require(profileNFT.hasProfile(msg.sender), "You must have a profile");
        require(profileNFT.hasProfile(_liked), "Target user has no profile");
        require(msg.sender != _liked, "Cannot like yourself");
        require(!likes[msg.sender][_liked], "Already liked this profile");

        // Check if both profiles are active
        (, , , , , , bool isActiveLiker) = profileNFT.getProfileByAddress(msg.sender);
        (, , , , , , bool isActiveLiked) = profileNFT.getProfileByAddress(_liked);
        require(isActiveLiker, "Your profile is not active");
        require(isActiveLiked, "Target profile is not active");

        // Record the like
        likes[msg.sender][_liked] = true;
        userLikes[msg.sender].push(_liked);
        receivedLikes[_liked].push(msg.sender);

        emit LikeGiven(msg.sender, _liked, block.timestamp);

        // Check if it's a mutual like (match)
        if (likes[_liked][msg.sender]) {
            _createMatch(msg.sender, _liked);
        }
    }

    /**
     * @dev Internal function to create a match
     */
    function _createMatch(address _user1, address _user2) private {
        // Check if match already exists
        uint256 existingMatchId = matchIndex[_user1][_user2];
        if (existingMatchId > 0 && matches[existingMatchId - 1].isActive) {
            return; // Match already exists and is active
        }

        Match memory newMatch = Match({
            user1: _user1,
            user2: _user2,
            timestamp: block.timestamp,
            isActive: true
        });

        matches.push(newMatch);
        uint256 matchId = matches.length - 1;

        // Store match index (add 1 to distinguish from default 0)
        matchIndex[_user1][_user2] = matchId + 1;
        matchIndex[_user2][_user1] = matchId + 1;

        // Add to user matches
        userMatches[_user1].push(matchId);
        userMatches[_user2].push(matchId);

        emit MatchCreated(_user1, _user2, matchId, block.timestamp);
    }

    /**
     * @dev Unmatch with another user
     */
    function unmatch(address _otherUser) public {
        uint256 mIndex = matchIndex[msg.sender][_otherUser];
        require(mIndex > 0, "No match exists");

        uint256 actualIndex = mIndex - 1;
        require(matches[actualIndex].isActive, "Match already inactive");

        matches[actualIndex].isActive = false;
        emit MatchDeactivated(actualIndex);
    }

    /**
     * @dev Get all matches for a user
     */
    function getUserMatches(address _user) public view returns (Match[] memory) {
        uint256[] memory matchIndices = userMatches[_user];
        Match[] memory userMatchList = new Match[](matchIndices.length);

        for (uint256 i = 0; i < matchIndices.length; i++) {
            userMatchList[i] = matches[matchIndices[i]];
        }

        return userMatchList;
    }

    /**
     * @dev Get active matches for a user
     */
    function getActiveMatches(address _user) public view returns (Match[] memory) {
        uint256[] memory matchIndices = userMatches[_user];

        // First, count active matches
        uint256 activeCount = 0;
        for (uint256 i = 0; i < matchIndices.length; i++) {
            if (matches[matchIndices[i]].isActive) {
                activeCount++;
            }
        }

        // Create array with exact size
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

    /**
     * @dev Check if two users have matched
     */
    function isMatch(address _user1, address _user2) public view returns (bool) {
        uint256 mIndex = matchIndex[_user1][_user2];
        if (mIndex == 0) return false;

        return matches[mIndex - 1].isActive;
    }

    /**
     * @dev Get users who liked the caller
     */
    function getReceivedLikes() public view returns (address[] memory) {
        return receivedLikes[msg.sender];
    }

    /**
     * @dev Get users the caller liked
     */
    function getSentLikes() public view returns (address[] memory) {
        return userLikes[msg.sender];
    }

    /**
     * @dev Get total number of matches
     */
    function getTotalMatches() public view returns (uint256) {
        return matches.length;
    }
}
