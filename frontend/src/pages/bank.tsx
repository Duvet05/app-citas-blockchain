import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBank, Loan } from '@/hooks/useBank';
import { useProfile } from '@/hooks/useProfile';
import { formatEther } from 'viem';
import toast from 'react-hot-toast';
import { ArrowLeft, Currency, ChartBar } from '@carbon/icons-react';

export default function Bank() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile();
  const router = useRouter();
  const {
    treasuryBalance,
    pendingRewards,
    loans,
    userDebt,
    activeLoansCount,
    maxLoanAmount,
    totalLoaned,
    totalRewardsPaid,
    requestLoan,
    repayLoan,
    claimRewards,
    isRequesting,
    isRepaying,
    isClaiming,
    refetchLoans,
    refetchTreasury,
  } = useBank(address);

  const [loanAmount, setLoanAmount] = useState('0.05');

  const fmt = (value?: bigint) =>
    value !== undefined ? parseFloat(formatEther(value)).toFixed(4) : '---';

  const handleRequestLoan = async () => {
    try {
      await requestLoan(loanAmount);
      toast.success(`Prestamo de ${loanAmount} tSYS solicitado!`);
      refetchLoans();
      refetchTreasury();
    } catch (error: any) {
      toast.error(error?.shortMessage || error?.message || 'Error al solicitar prestamo');
    }
  };

  const handleRepayLoan = async (index: number, amount: bigint) => {
    try {
      await repayLoan(index, amount);
      toast.success('Prestamo pagado!');
      refetchLoans();
      refetchTreasury();
    } catch (error: any) {
      toast.error(error?.shortMessage || error?.message || 'Error al pagar prestamo');
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
      toast.success('Recompensas cobradas!');
      refetchTreasury();
    } catch (error: any) {
      toast.error(error?.shortMessage || error?.message || 'Sin recompensas por cobrar');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Conecta tu Wallet</h2>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <Currency size={32} className="text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            CupidoBank
          </h1>
        </div>

        {/* Treasury Overview */}
        <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tesoreria</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{fmt(treasuryBalance)}</p>
              <p className="text-xs text-gray-500">Balance (tSYS)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{fmt(totalLoaned)}</p>
              <p className="text-xs text-gray-500">Total Prestado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{fmt(totalRewardsPaid)}</p>
              <p className="text-xs text-gray-500">Recompensas Pagadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{fmt(userDebt)}</p>
              <p className="text-xs text-gray-500">Tu Deuda</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Rewards */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartBar size={24} className="text-purple-500" />
              <h2 className="text-xl font-bold">Tus Recompensas</h2>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-4">
              {fmt(pendingRewards)} tSYS
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Ganadas cuando alguien le da like a tu perfil. Cobra cuando quieras.
            </p>
            <button
              onClick={handleClaimRewards}
              disabled={isClaiming || !pendingRewards || pendingRewards === BigInt(0)}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isClaiming ? 'Cobrando...' : 'Cobrar Recompensas'}
            </button>
          </div>

          {/* Request Loan */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Currency size={24} className="text-green-500" />
              <h2 className="text-xl font-bold">Solicitar Prestamo</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Pide tSYS prestado para participar. Max {fmt(maxLoanAmount)} tSYS por prestamo.
              Prestamos activos: {activeLoansCount}/3
            </p>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.1"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Cantidad en tSYS"
              />
              <button
                onClick={handleRequestLoan}
                disabled={isRequesting || activeLoansCount >= 3 || !hasProfile}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isRequesting ? 'Enviando...' : 'Pedir'}
              </button>
            </div>
            {!hasProfile && (
              <p className="text-xs text-red-500">Necesitas un perfil para pedir prestamos</p>
            )}
          </div>
        </div>

        {/* Active Loans */}
        {loans.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Tus Prestamos</h2>
            <div className="space-y-3">
              {loans.map((loan: Loan, index: number) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    loan.repaid
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {fmt(loan.amount)} tSYS
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(Number(loan.timestamp) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {loan.repaid ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Pagado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRepayLoan(index, loan.amount)}
                        disabled={isRepaying}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        {isRepaying ? 'Pagando...' : 'Pagar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200 p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Como funciona CupidoBank?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">1.</span>
              <span><strong>Likes pagados:</strong> Cada like cuesta 0.01 tSYS. 50% va al banco, 50% al usuario que recibio el like.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">2.</span>
              <span><strong>Match mutuo:</strong> Cuando ambos se dan like, los dos reciben 0.005 tSYS del banco automaticamente.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">3.</span>
              <span><strong>Prestamos:</strong> Pide hasta 0.1 tSYS prestado para participar. Max 3 prestamos activos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">4.</span>
              <span><strong>Recompensas:</strong> Cobra tus ganancias acumuladas cuando quieras.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
