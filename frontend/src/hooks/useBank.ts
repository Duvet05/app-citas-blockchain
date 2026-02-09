import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CUPIDO_BANK_ABI } from '@/lib/contracts';
import { Address, parseEther } from 'viem';

export interface Loan {
  amount: bigint;
  timestamp: bigint;
  repaid: boolean;
}

export function useBank(address?: Address) {
  const bankAddress = CONTRACT_ADDRESSES.CUPIDO_BANK as Address;

  // --- Reads ---
  const { data: treasuryBalance, refetch: refetchTreasury } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'getTreasuryBalance',
  });

  const { data: pendingRewards } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userLoans, refetch: refetchLoans } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: userDebt } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'getUserDebt',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: activeLoansCount } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'getActiveLoansCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: maxLoanAmount } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'maxLoanAmount',
  });

  const { data: totalLoaned } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'totalLoaned',
  });

  const { data: totalRewardsPaid } = useReadContract({
    address: bankAddress,
    abi: CUPIDO_BANK_ABI,
    functionName: 'totalRewardsPaid',
  });

  // --- Writes ---
  const { writeContract: requestLoanWrite, data: loanHash } = useWriteContract();
  const { isLoading: isRequesting, isSuccess: isLoanGranted } = useWaitForTransactionReceipt({
    hash: loanHash,
  });

  const requestLoan = async (amountEther: string) => {
    return requestLoanWrite({
      address: bankAddress,
      abi: CUPIDO_BANK_ABI,
      functionName: 'requestLoan',
      args: [parseEther(amountEther)],
    });
  };

  const { writeContract: repayLoanWrite, data: repayHash } = useWriteContract();
  const { isLoading: isRepaying, isSuccess: isRepaid } = useWaitForTransactionReceipt({
    hash: repayHash,
  });

  const repayLoan = async (loanIndex: number, amountWei: bigint) => {
    return repayLoanWrite({
      address: bankAddress,
      abi: CUPIDO_BANK_ABI,
      functionName: 'repayLoan',
      args: [BigInt(loanIndex)],
      value: amountWei,
    });
  };

  const { writeContract: claimRewardsWrite, data: claimHash } = useWriteContract();
  const { isLoading: isClaiming, isSuccess: isClaimed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const claimRewards = async () => {
    return claimRewardsWrite({
      address: bankAddress,
      abi: CUPIDO_BANK_ABI,
      functionName: 'claimRewards',
    });
  };

  const loans: Loan[] = (userLoans as Loan[] | undefined) || [];

  return {
    treasuryBalance: treasuryBalance as bigint | undefined,
    pendingRewards: pendingRewards as bigint | undefined,
    loans,
    userDebt: userDebt as bigint | undefined,
    activeLoansCount: activeLoansCount ? Number(activeLoansCount) : 0,
    maxLoanAmount: maxLoanAmount as bigint | undefined,
    totalLoaned: totalLoaned as bigint | undefined,
    totalRewardsPaid: totalRewardsPaid as bigint | undefined,
    requestLoan,
    repayLoan,
    claimRewards,
    refetchLoans,
    refetchTreasury,
    isRequesting,
    isLoanGranted,
    isRepaying,
    isRepaid,
    isClaiming,
    isClaimed,
  };
}
