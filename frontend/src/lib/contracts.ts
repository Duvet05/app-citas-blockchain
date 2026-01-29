// Contract addresses - update after deployment
export const CONTRACT_ADDRESSES = {
  PROFILE_NFT: process.env.NEXT_PUBLIC_PROFILE_NFT_ADDRESS || '',
  MATCH_SYSTEM: process.env.NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS || '',
  VERIFICATION_SYSTEM: process.env.NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS || '',
} as const;

// ABIs - simplified versions for frontend use
export const PROFILE_NFT_ABI = [
  'function createProfile(string memory _name, uint256 _age, string memory _bio, string memory _interests, string memory _tokenURI) public returns (uint256)',
  'function updateProfile(string memory _name, string memory _bio, string memory _interests, string memory _tokenURI) public',
  'function deactivateProfile() public',
  'function reactivateProfile() public',
  'function getProfileByAddress(address _user) public view returns (uint256 tokenId, string memory name, uint256 age, string memory bio, string memory interests, uint256 createdAt, bool isActive)',
  'function hasProfile(address _user) public view returns (bool)',
  'function getTotalProfiles() public view returns (uint256)',
  'function addressToProfile(address) public view returns (uint256)',
  'event ProfileCreated(address indexed owner, uint256 indexed tokenId, string name)',
  'event ProfileUpdated(uint256 indexed tokenId, string name, string bio)',
] as const;

export const MATCH_SYSTEM_ABI = [
  'function likeProfile(address _liked) public',
  'function unmatch(address _otherUser) public',
  'function getUserMatches(address _user) public view returns (tuple(address user1, address user2, uint256 timestamp, bool isActive)[])',
  'function getActiveMatches(address _user) public view returns (tuple(address user1, address user2, uint256 timestamp, bool isActive)[])',
  'function isMatch(address _user1, address _user2) public view returns (bool)',
  'function getReceivedLikes() public view returns (address[])',
  'function getSentLikes() public view returns (address[])',
  'function getTotalMatches() public view returns (uint256)',
  'event LikeGiven(address indexed liker, address indexed liked, uint256 timestamp)',
  'event MatchCreated(address indexed user1, address indexed user2, uint256 matchId, uint256 timestamp)',
] as const;

export const VERIFICATION_SYSTEM_ABI = [
  'function grantVerification(address _user, uint8 _verificationType, uint256 _expiresAt) public',
  'function revokeVerification(address _user, uint8 _verificationType) public',
  'function isVerified(address _user, uint8 _verificationType) public view returns (bool)',
  'function getUserVerifications(address _user) public view returns (uint8[] memory types, bool[] memory statuses, uint256[] memory timestamps)',
  'function isVerifier(address) public view returns (bool)',
  'event VerificationGranted(address indexed user, uint8 indexed verificationType, address indexed verifier, uint256 timestamp)',
] as const;

// Verification types enum
export enum VerificationType {
  IDENTITY = 0,
  AGE = 1,
  MARITAL_STATUS = 2,
  BACKGROUND_CHECK = 3,
  EDUCATION = 4,
  EMPLOYMENT = 5,
}

export const VERIFICATION_LABELS = {
  [VerificationType.IDENTITY]: 'Identity Verified',
  [VerificationType.AGE]: 'Age Verified (18+)',
  [VerificationType.MARITAL_STATUS]: 'Single Status',
  [VerificationType.BACKGROUND_CHECK]: 'Background Check',
  [VerificationType.EDUCATION]: 'Education Verified',
  [VerificationType.EMPLOYMENT]: 'Employment Verified',
} as const;
