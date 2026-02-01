// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProfileNFT.sol";

/**
 * @title VerificationSystem (Education & Participation Tracking)
 * @dev Tracks completion of educational modules and participation badges
 * Users complete modules about healthy relationships, consent, communication
 * Verifications act as "education completion certificates" (NFT-like badges)
 */
contract VerificationSystem is Ownable {
    ProfileNFT public profileNFT;

    // Verification types
    enum VerificationType {
        IDENTITY,           // Real identity verification
        AGE,               // Age verification (18+)
        MARITAL_STATUS,    // Single status
        BACKGROUND_CHECK,  // No criminal record
        EDUCATION,         // Educational credentials
        EMPLOYMENT         // Employment status
    }

    // Verification status
    struct Verification {
        VerificationType verificationType;
        bool isVerified;
        uint256 verifiedAt;
        address verifiedBy;
        uint256 expiresAt; // 0 means no expiration
    }

    // Mapping: user address => verification type => verification data
    mapping(address => mapping(VerificationType => Verification)) public verifications;

    // Mapping: user address => array of verification types they have
    mapping(address => VerificationType[]) public userVerifications;

    // Trusted verifiers (in production, this would be decentralized)
    mapping(address => bool) public isVerifier;

    // Events
    event VerificationGranted(
        address indexed user,
        VerificationType indexed verificationType,
        address indexed verifier,
        uint256 timestamp
    );
    event VerificationRevoked(
        address indexed user,
        VerificationType indexed verificationType,
        address indexed verifier,
        uint256 timestamp
    );
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    constructor(address _profileNFTAddress) Ownable(msg.sender) {
        profileNFT = ProfileNFT(_profileNFTAddress);
        // Owner is a verifier by default
        isVerifier[msg.sender] = true;
    }

    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "Not authorized verifier");
        _;
    }

    /**
     * @dev Add a trusted verifier
     */
    function addVerifier(address _verifier) public onlyOwner {
        require(_verifier != address(0), "Invalid address");
        isVerifier[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    /**
     * @dev Remove a verifier
     */
    function removeVerifier(address _verifier) public onlyOwner {
        isVerifier[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    /**
     * @dev Grant verification to a user
     * @param _user Address of the user to verify
     * @param _verificationType Type of verification
     * @param _expiresAt Expiration timestamp (0 for no expiration)
     */
    function grantVerification(
        address _user,
        VerificationType _verificationType,
        uint256 _expiresAt
    ) public onlyVerifier {
        require(profileNFT.hasProfile(_user), "User has no profile");

        // Check if verification already exists
        if (!verifications[_user][_verificationType].isVerified) {
            userVerifications[_user].push(_verificationType);
        }

        verifications[_user][_verificationType] = Verification({
            verificationType: _verificationType,
            isVerified: true,
            verifiedAt: block.timestamp,
            verifiedBy: msg.sender,
            expiresAt: _expiresAt
        });

        emit VerificationGranted(_user, _verificationType, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke verification from a user
     */
    function revokeVerification(
        address _user,
        VerificationType _verificationType
    ) public onlyVerifier {
        require(
            verifications[_user][_verificationType].isVerified,
            "User not verified for this type"
        );

        verifications[_user][_verificationType].isVerified = false;

        emit VerificationRevoked(_user, _verificationType, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if user has a specific verification
     */
    function isVerified(
        address _user,
        VerificationType _verificationType
    ) public view returns (bool) {
        Verification memory verification = verifications[_user][_verificationType];

        if (!verification.isVerified) {
            return false;
        }

        // Check expiration
        if (verification.expiresAt > 0 && block.timestamp > verification.expiresAt) {
            return false;
        }

        return true;
    }

    /**
     * @dev Get all verifications for a user
     */
    function getUserVerifications(address _user) public view returns (
        VerificationType[] memory types,
        bool[] memory statuses,
        uint256[] memory timestamps
    ) {
        VerificationType[] memory allTypes = userVerifications[_user];
        uint256 length = allTypes.length;

        types = new VerificationType[](length);
        statuses = new bool[](length);
        timestamps = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            types[i] = allTypes[i];
            Verification memory verification = verifications[_user][allTypes[i]];
            statuses[i] = isVerified(_user, allTypes[i]);
            timestamps[i] = verification.verifiedAt;
        }

        return (types, statuses, timestamps);
    }

    /**
     * @dev Get verification details
     */
    function getVerificationDetails(
        address _user,
        VerificationType _verificationType
    ) public view returns (
        bool isVerifiedStatus,
        uint256 verifiedAt,
        address verifiedBy,
        uint256 expiresAt
    ) {
        Verification memory verification = verifications[_user][_verificationType];

        return (
            isVerified(_user, _verificationType),
            verification.verifiedAt,
            verification.verifiedBy,
            verification.expiresAt
        );
    }

    /**
     * @dev Batch verification for multiple users
     */
    function batchGrantVerification(
        address[] memory _users,
        VerificationType _verificationType,
        uint256 _expiresAt
    ) public onlyVerifier {
        for (uint256 i = 0; i < _users.length; i++) {
            if (profileNFT.hasProfile(_users[i])) {
                grantVerification(_users[i], _verificationType, _expiresAt);
            }
        }
    }
}
