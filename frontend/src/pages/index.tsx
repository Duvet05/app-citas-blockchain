import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FiHeart, FiShield, FiUsers } from 'react-icons/fi';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && hasProfile) {
      router.push('/explore');
    }
  }, [isConnected, hasProfile, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiHeart className="text-pink-500 text-3xl" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Web3 Dating
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Find Your Match,
            <br />
            Verified on Blockchain
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            The first dating app where trust is built on blockchain. Verify your identity securely
            with zero-knowledge proofs and meet verified people.
          </p>

          {isConnected ? (
            hasProfile ? (
              <button
                onClick={() => router.push('/explore')}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Exploring
              </button>
            ) : (
              <button
                onClick={() => router.push('/create-profile')}
                className="btn-primary text-lg px-8 py-4"
              >
                Create Your Profile
              </button>
            )
          ) : (
            <div>
              <ConnectButton />
              <p className="mt-4 text-sm text-gray-500">
                Connect your wallet to get started
              </p>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-gray-600">
                Verify your identity without revealing personal data using zero-knowledge proofs
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
              <p className="text-gray-600">
                Meet real people with verified attributes - age, identity, background checks
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">True Matches</h3>
              <p className="text-gray-600">
                Transparent matching system on blockchain - no fake profiles, no bots
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Built on Syscoin Blockchain | Hackathon 2026</p>
      </footer>
    </div>
  );
}
