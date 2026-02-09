// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ProfileNFT.sol";

/**
 * @title CupidoBank
 * @dev Central treasury for the Cupido PoDA paid karma system.
 * Holds tSYS, lends to users, and disburses match rewards.
 */
contract CupidoBank is Ownable, ReentrancyGuard {
    ProfileNFT public profileNFT;

    struct Loan {
        uint256 amount;
        uint256 timestamp;
        bool repaid;
    }

    // --- State ---
    mapping(address => Loan[]) public loans;
    mapping(address => uint256) public totalBorrowed;
    mapping(address => uint256) public totalRepaid;
    mapping(address => uint256) public pendingRewards;
    mapping(address => bool) public authorizedContracts;

    uint256 public maxLoanAmount = 0.1 ether;
    uint256 public maxLoansPerUser = 3;
    uint256 public totalLoaned;
    uint256 public totalRepaidGlobal;
    uint256 public totalDeposited;
    uint256 public totalRewardsPaid;

    // --- Events ---
    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event LoanGranted(address indexed borrower, uint256 amount, uint256 loanIndex);
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 loanIndex);
    event RewardAdded(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardSent(address indexed user, uint256 amount);
    event ContractAuthorized(address indexed contractAddr);
    event ContractDeauthorized(address indexed contractAddr);

    // --- Modifiers ---
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender], "Not authorized");
        _;
    }

    // --- Constructor ---
    constructor(address _profileNFTAddress) Ownable(msg.sender) {
        profileNFT = ProfileNFT(_profileNFTAddress);
    }

    // --- Receive (accepts ETH from PaidMatchSystem) ---
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // --- Admin Functions ---

    function deposit() external payable onlyOwner {
        require(msg.value > 0, "Must deposit > 0");
        totalDeposited += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = payable(owner()).call{value: _amount}("");
        require(sent, "Transfer failed");
        emit Withdrawal(owner(), _amount);
    }

    function authorizeContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        authorizedContracts[_contract] = true;
        emit ContractAuthorized(_contract);
    }

    function deauthorizeContract(address _contract) external onlyOwner {
        authorizedContracts[_contract] = false;
        emit ContractDeauthorized(_contract);
    }

    function setMaxLoanAmount(uint256 _amount) external onlyOwner {
        maxLoanAmount = _amount;
    }

    function setMaxLoansPerUser(uint256 _max) external onlyOwner {
        maxLoansPerUser = _max;
    }

    // --- User Functions ---

    function requestLoan(uint256 _amount) external nonReentrant {
        require(profileNFT.hasProfile(msg.sender), "Must have a profile");
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= maxLoanAmount, "Exceeds max loan amount");
        require(getActiveLoansCount(msg.sender) < maxLoansPerUser, "Too many active loans");
        require(address(this).balance >= _amount, "Bank has insufficient funds");

        loans[msg.sender].push(Loan({
            amount: _amount,
            timestamp: block.timestamp,
            repaid: false
        }));

        totalBorrowed[msg.sender] += _amount;
        totalLoaned += _amount;

        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Transfer failed");

        emit LoanGranted(msg.sender, _amount, loans[msg.sender].length - 1);
    }

    function repayLoan(uint256 _loanIndex) external payable nonReentrant {
        require(_loanIndex < loans[msg.sender].length, "Invalid loan index");
        Loan storage loan = loans[msg.sender][_loanIndex];
        require(!loan.repaid, "Loan already repaid");
        require(msg.value >= loan.amount, "Insufficient repayment");

        loan.repaid = true;
        totalRepaid[msg.sender] += loan.amount;
        totalRepaidGlobal += loan.amount;

        // Refund excess payment
        uint256 excess = msg.value - loan.amount;
        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit LoanRepaid(msg.sender, loan.amount, _loanIndex);
    }

    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(address(this).balance >= amount, "Bank has insufficient funds");

        pendingRewards[msg.sender] = 0;
        totalRewardsPaid += amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Transfer failed");

        emit RewardClaimed(msg.sender, amount);
    }

    // --- Authorized Contract Functions ---

    function addReward(address _user, uint256 _amount) external onlyAuthorized {
        pendingRewards[_user] += _amount;
        emit RewardAdded(_user, _amount);
    }

    function sendReward(address _user, uint256 _amount) external onlyAuthorized nonReentrant {
        require(address(this).balance >= _amount, "Bank has insufficient funds");
        totalRewardsPaid += _amount;

        (bool sent, ) = payable(_user).call{value: _amount}("");
        require(sent, "Reward transfer failed");

        emit RewardSent(_user, _amount);
    }

    // --- View Functions ---

    function getActiveLoansCount(address _user) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < loans[_user].length; i++) {
            if (!loans[_user][i].repaid) {
                count++;
            }
        }
        return count;
    }

    function getUserLoans(address _user) external view returns (Loan[] memory) {
        return loans[_user];
    }

    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserDebt(address _user) external view returns (uint256) {
        return totalBorrowed[_user] - totalRepaid[_user];
    }
}
