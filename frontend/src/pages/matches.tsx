import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useMatches } from '@/hooks/useMatches';
import { useProfile } from '@/hooks/useProfile';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import { ProfileCard } from '@/components/ProfileCard';

export default function Matches() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address);
  const { matches } = useMatches(address);
  const router = useRouter();

  if (!isConnected || !hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Not Connected</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet and create a profile to view matches
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  const getOtherUser = (match: any) => {
    return match.user1.toLowerCase() === address?.toLowerCase()
      ? match.user2
      : match.user1;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <button
          onClick={() => router.push('/explore')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft /> Back
        </button>
        <ConnectButton />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <FiHeart className="text-pink-500 text-3xl" />
            <h1 className="text-3xl font-bold">Your Matches</h1>
          </div>

          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
              <p className="text-gray-600 mb-6">
                Start exploring profiles to find your perfect match!
              </p>
              <button
                onClick={() => router.push('/explore')}
                className="btn-primary"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => {
                const otherUser = getOtherUser(match);
                return (
                  <div key={index} className="relative">
                    <ProfileCard address={otherUser} />
                    <div className="mt-2 text-center">
                      <span className="text-sm text-gray-500">
                        Matched on {new Date(Number(match.timestamp) * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {matches.length > 0 && (
            <div className="mt-8 card bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Total Matches:</strong> {matches.length}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                All matches are verified on the Syscoin blockchain and transparent.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
