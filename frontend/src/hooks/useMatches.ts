import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, MATCH_SYSTEM_ABI } from '@/lib/contracts';
import { Address } from 'viem';

export interface Match {
  user1: Address;
  user2: Address;
  timestamp: bigint;
  isActive: boolean;
}

export function useMatches(address?: Address) {
  const { data: activeMatches, refetch: refetchMatches } = useReadContract({
    address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
    abi: MATCH_SYSTEM_ABI,
    functionName: 'getActiveMatches',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: receivedLikes } = useReadContract({
    address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
    abi: MATCH_SYSTEM_ABI,
    functionName: 'getReceivedLikes',
    query: {
      enabled: !!address,
    },
  });

  const { data: sentLikes } = useReadContract({
    address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
    abi: MATCH_SYSTEM_ABI,
    functionName: 'getSentLikes',
    query: {
      enabled: !!address,
    },
  });

  const { writeContract: likeProfileWrite, data: likeHash } = useWriteContract();
  const { isLoading: isLiking, isSuccess: isLiked } = useWaitForTransactionReceipt({
    hash: likeHash,
  });

  const { writeContract: unmatchWrite, data: unmatchHash } = useWriteContract();
  const { isLoading: isUnmatching, isSuccess: isUnmatched } = useWaitForTransactionReceipt({
    hash: unmatchHash,
  });

  const likeProfile = async (likedAddress: Address) => {
    return likeProfileWrite({
      address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
      abi: MATCH_SYSTEM_ABI,
      functionName: 'likeProfile',
      args: [likedAddress],
    });
  };

  const unmatch = async (otherUserAddress: Address) => {
    return unmatchWrite({
      address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
      abi: MATCH_SYSTEM_ABI,
      functionName: 'unmatch',
      args: [otherUserAddress],
    });
  };

  const matches = (activeMatches as Match[] | undefined) || [];

  return {
    matches,
    receivedLikes: (receivedLikes as Address[] | undefined) || [],
    sentLikes: (sentLikes as Address[] | undefined) || [],
    likeProfile,
    unmatch,
    isLiking,
    isLiked,
    isUnmatching,
    isUnmatched,
    refetchMatches,
  };
}

export function useIsMatch(user1?: Address, user2?: Address) {
  const { data: isMatch } = useReadContract({
    address: CONTRACT_ADDRESSES.MATCH_SYSTEM as Address,
    abi: MATCH_SYSTEM_ABI,
    functionName: 'isMatch',
    args: user1 && user2 ? [user1, user2] : undefined,
    query: {
      enabled: !!user1 && !!user2,
    },
  });

  return !!isMatch;
}
