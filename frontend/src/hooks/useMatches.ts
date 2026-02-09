import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, PAID_MATCH_SYSTEM_ABI } from '@/lib/contracts';
import { Address } from 'viem';

export interface Match {
  user1: Address;
  user2: Address;
  timestamp: bigint;
  isActive: boolean;
}

export function useMatches(address?: Address) {
  const contractAddress = CONTRACT_ADDRESSES.PAID_MATCH_SYSTEM as Address;
  const abi = PAID_MATCH_SYSTEM_ABI;

  const { data: activeMatches, refetch: refetchMatches } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getActiveMatches',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: receivedLikes } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getReceivedLikes',
    query: { enabled: !!address },
  });

  const { data: sentLikes } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getSentLikes',
    query: { enabled: !!address },
  });

  const { data: likeFee } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'likeFee',
  });

  const { data: userEconomics } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'getUserEconomics',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
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
      address: contractAddress,
      abi,
      functionName: 'likeProfile',
      args: [likedAddress],
      value: (likeFee as bigint) || BigInt(0.01e18),
    });
  };

  const unmatch = async (otherUserAddress: Address) => {
    return unmatchWrite({
      address: contractAddress,
      abi,
      functionName: 'unmatch',
      args: [otherUserAddress],
    });
  };

  const matches = (activeMatches as Match[] | undefined) || [];

  const economics = userEconomics && Array.isArray(userEconomics)
    ? {
        earned: userEconomics[0] as bigint,
        spent: userEconomics[1] as bigint,
        pending: userEconomics[2] as bigint,
      }
    : { earned: BigInt(0), spent: BigInt(0), pending: BigInt(0) };

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
    likeFee: likeFee as bigint | undefined,
    economics,
  };
}

export function useIsMatch(user1?: Address, user2?: Address) {
  const { data: isMatch } = useReadContract({
    address: CONTRACT_ADDRESSES.PAID_MATCH_SYSTEM as Address,
    abi: PAID_MATCH_SYSTEM_ABI,
    functionName: 'isMatch',
    args: user1 && user2 ? [user1, user2] : undefined,
    query: { enabled: !!user1 && !!user2 },
  });

  return !!isMatch;
}
