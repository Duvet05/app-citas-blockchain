import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, PROFILE_NFT_ABI } from '@/lib/contracts';
import { Address } from 'viem';

export interface Profile {
  tokenId: bigint;
  name: string;
  age: bigint;
  bio: string;
  interests: string;
  createdAt: bigint;
  isActive: boolean;
}

export function useProfile(address?: Address) {
  const { data: hasProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.PROFILE_NFT as Address,
    abi: PROFILE_NFT_ABI,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
  });

  const { data: profileData } = useReadContract({
    address: CONTRACT_ADDRESSES.PROFILE_NFT as Address,
    abi: PROFILE_NFT_ABI,
    functionName: 'getProfileByAddress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!hasProfile,
    },
  });

  const { writeContract: createProfileWrite, data: createHash } = useWriteContract();
  const { isLoading: isCreating, isSuccess: isCreated } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { writeContract: updateProfileWrite, data: updateHash } = useWriteContract();
  const { isLoading: isUpdating, isSuccess: isUpdated } = useWaitForTransactionReceipt({
    hash: updateHash,
  });

  const createProfile = async (
    name: string,
    age: number,
    bio: string,
    interests: string,
    tokenURI: string
  ) => {
    return createProfileWrite({
      address: CONTRACT_ADDRESSES.PROFILE_NFT as Address,
      abi: PROFILE_NFT_ABI,
      functionName: 'createProfile',
      args: [name, BigInt(age), bio, interests, tokenURI],
    });
  };

  const updateProfile = async (
    name: string,
    bio: string,
    interests: string,
    tokenURI: string
  ) => {
    return updateProfileWrite({
      address: CONTRACT_ADDRESSES.PROFILE_NFT as Address,
      abi: PROFILE_NFT_ABI,
      functionName: 'updateProfile',
      args: [name, bio, interests, tokenURI],
    });
  };

  const profile: Profile | null = profileData && Array.isArray(profileData)
    ? {
        tokenId: profileData[0] as bigint,
        name: profileData[1] as string,
        age: profileData[2] as bigint,
        bio: profileData[3] as string,
        interests: profileData[4] as string,
        createdAt: profileData[5] as bigint,
        isActive: profileData[6] as boolean,
      }
    : null;

  return {
    hasProfile: !!hasProfile,
    profile,
    createProfile,
    updateProfile,
    isCreating,
    isCreated,
    isUpdating,
    isUpdated,
  };
}

export function useTotalProfiles() {
  const { data: totalProfiles } = useReadContract({
    address: CONTRACT_ADDRESSES.PROFILE_NFT as Address,
    abi: PROFILE_NFT_ABI,
    functionName: 'getTotalProfiles',
  });

  return totalProfiles ? Number(totalProfiles) : 0;
}
