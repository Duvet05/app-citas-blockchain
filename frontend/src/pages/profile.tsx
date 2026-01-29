import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useProfile } from '@/hooks/useProfile';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FiArrowLeft, FiEdit, FiCheckCircle } from 'react-icons/fi';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { hasProfile, profile } = useProfile(address);
  const router = useRouter();

  if (!isConnected || !hasProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Profile Found</h2>
          <p className="text-gray-600 mb-6">
            Please create a profile to continue
          </p>
          <button
            onClick={() => router.push('/create-profile')}
            className="btn-primary"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const interests = profile.interests.split(',').map(i => i.trim()).filter(Boolean);

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
        <div className="max-w-2xl mx-auto">
          <div className="card">
            {/* Profile Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                <p className="text-gray-600">{Number(profile.age)} years old</p>
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <FiEdit /> Edit
              </button>
            </div>

            {/* Profile Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-xl mb-6 flex items-center justify-center relative">
              <div className="text-white text-8xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              {profile.isActive && (
                <div className="absolute top-4 right-4">
                  <div className="badge-verified flex items-center gap-1">
                    <FiCheckCircle className="text-green-600" />
                    Active
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">About Me</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}

            {/* Interests */}
            {interests.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Blockchain Info */}
            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profile NFT ID:</span>
                <span className="font-mono">#{Number(profile.tokenId)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(Number(profile.createdAt) * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Wallet:</span>
                <span className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>

            {/* Verifications */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Verifications</h3>
              <p className="text-sm text-yellow-700">
                Get verified to build trust and increase your matches. Contact a verifier to add
                identity verification, background checks, and more.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
