// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProfileNFT
 * @dev NFT contract for user karma profiles
 * Each user can only have ONE profile NFT (soulbound)
 * Represents participation in the karma system
 */
contract ProfileNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from address to profile token ID (one profile per address)
    mapping(address => uint256) public addressToProfile;

    // Mapping to check if address has a profile
    mapping(address => bool) public hasProfile;

    // Profile metadata structure
    struct ProfileData {
        string name;
        uint256 age;
        string bio;
        string interests;
        uint256 createdAt;
        bool isActive;
    }

    // Mapping from token ID to profile data
    mapping(uint256 => ProfileData) public profiles;

    // Events
    event ProfileCreated(address indexed owner, uint256 indexed tokenId, string name);
    event ProfileUpdated(uint256 indexed tokenId, string name, string bio);
    event ProfileDeactivated(uint256 indexed tokenId);
    event ProfileReactivated(uint256 indexed tokenId);

    constructor() ERC721("KarmaProfile", "KARMA") Ownable(msg.sender) {}

    /**
     * @dev Create a new profile NFT
     * @param _name User's display name
     * @param _age User's age
     * @param _bio User's biography
     * @param _interests User's interests (comma-separated)
     * @param _tokenURI IPFS URI for profile image/metadata
     */
    function createProfile(
        string memory _name,
        uint256 _age,
        string memory _bio,
        string memory _interests,
        string memory _tokenURI
    ) public returns (uint256) {
        require(!hasProfile[msg.sender], "Profile already exists");
        require(_age >= 18, "Must be 18 or older");
        require(bytes(_name).length > 0, "Name cannot be empty");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        profiles[tokenId] = ProfileData({
            name: _name,
            age: _age,
            bio: _bio,
            interests: _interests,
            createdAt: block.timestamp,
            isActive: true
        });

        addressToProfile[msg.sender] = tokenId;
        hasProfile[msg.sender] = true;

        emit ProfileCreated(msg.sender, tokenId, _name);

        return tokenId;
    }

    /**
     * @dev Update profile information
     */
    function updateProfile(
        string memory _name,
        string memory _bio,
        string memory _interests,
        string memory _tokenURI
    ) public {
        require(hasProfile[msg.sender], "No profile exists");
        uint256 tokenId = addressToProfile[msg.sender];
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");

        ProfileData storage profile = profiles[tokenId];
        profile.name = _name;
        profile.bio = _bio;
        profile.interests = _interests;

        if (bytes(_tokenURI).length > 0) {
            _setTokenURI(tokenId, _tokenURI);
        }

        emit ProfileUpdated(tokenId, _name, _bio);
    }

    /**
     * @dev Deactivate profile (hide from matches)
     */
    function deactivateProfile() public {
        require(hasProfile[msg.sender], "No profile exists");
        uint256 tokenId = addressToProfile[msg.sender];
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");

        profiles[tokenId].isActive = false;
        emit ProfileDeactivated(tokenId);
    }

    /**
     * @dev Reactivate profile
     */
    function reactivateProfile() public {
        require(hasProfile[msg.sender], "No profile exists");
        uint256 tokenId = addressToProfile[msg.sender];
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");

        profiles[tokenId].isActive = true;
        emit ProfileReactivated(tokenId);
    }

    /**
     * @dev Get profile by address
     */
    function getProfileByAddress(address _user) public view returns (
        uint256 tokenId,
        string memory name,
        uint256 age,
        string memory bio,
        string memory interests,
        uint256 createdAt,
        bool isActive
    ) {
        require(hasProfile[_user], "No profile exists");
        tokenId = addressToProfile[_user];
        ProfileData memory profile = profiles[tokenId];

        return (
            tokenId,
            profile.name,
            profile.age,
            profile.bio,
            profile.interests,
            profile.createdAt,
            profile.isActive
        );
    }

    /**
     * @dev Get total number of profiles
     */
    function getTotalProfiles() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Override _update to prevent transfers (soulbound NFT)
     * Only minting is allowed (from == address(0))
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Block all transfers (from != address(0))
        if (from != address(0)) {
            revert("Profile NFTs are soulbound and cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
