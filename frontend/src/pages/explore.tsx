import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useProfile, useTotalProfiles } from '@/hooks/useProfile';
import { useMatches } from '@/hooks/useMatches';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ProfileCard } from '@/components/ProfileCard';
import { FiHeart, FiX, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Address } from 'viem';

export default function Explore() {
  const { address, isConnected } = useAccount();
  const { hasProfile } = useProfile(address);
  const { likeProfile, isLiking, sentLikes } = useMatches(address);
  const totalProfiles = useTotalProfiles();
  const router = useRouter();

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [availableProfiles, setAvailableProfiles] = useState<Address[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    if (!hasProfile) {
      router.push('/create-profile');
      return;
    }
  }, [isConnected, hasProfile, router]);

  // Generate mock profile addresses for demo
  // In production, you would fetch real profiles from the blockchain
  useEffect(() => {
    const generateMockProfiles = () => {
      const profiles: Address[] = [];
      const count = Math.min(totalProfiles, 10);

      for (let i = 0; i < count; i++) {
        // Generate deterministic addresses for demo
        const mockAddress = `0x${i.toString().padStart(40, '0')}` as Address;
        if (mockAddress.toLowerCase() !== address?.toLowerCase() &&
            !sentLikes.includes(mockAddress)) {
          profiles.push(mockAddress);
        }
      }

      setAvailableProfiles(profiles);
    };

    if (totalProfiles > 0) {
      generateMockProfiles();
    }
  }, [totalProfiles, address, sentLikes]);

  const handleLike = async () => {
    if (currentProfileIndex >= availableProfiles.length) return;

    const profileAddress = availableProfiles[currentProfileIndex];

    try {
      await likeProfile(profileAddress);
      toast.success('Profile liked! 💖');
      nextProfile();
    } catch (error: any) {
      console.error('Error liking profile:', error);
      toast.error(error?.message || 'Failed to like profile');
    }
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentProfileIndex < availableProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      toast('No more profiles to show', { icon: '🎉' });
    }
  };

  if (!isConnected || !hasProfile) {
    return null;
  }

  const currentProfile = availableProfiles[currentProfileIndex];
  const hasMoreProfiles = currentProfileIndex < availableProfiles.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiHeart className="text-pink-500 text-3xl" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Web3 Dating
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu className="text-2xl" />
          </button>
          <ConnectButton />
        </div>
      </header>

      {/* Navigation Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowMenu(false)}>
          <div className="card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Menu</h2>
            <nav className="space-y-2">
              <button
                onClick={() => router.push('/profile')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={() => router.push('/matches')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                My Matches
              </button>
              <button
                onClick={() => router.push('/explore')}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-purple-600"
              >
                Explore
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {hasMoreProfiles && currentProfile ? (
          <div className="space-y-6">
            <ProfileCard address={currentProfile} />

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePass}
                className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-200"
                disabled={isLiking}
              >
                <FiX className="text-3xl text-gray-500" />
              </button>

              <button
                onClick={handleLike}
                disabled={isLiking}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
              >
                <FiHeart className="text-3xl text-white" />
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              {currentProfileIndex + 1} / {availableProfiles.length}
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No More Profiles</h2>
            <p className="text-gray-600 mb-6">
              You've seen all available profiles. Check back later for new matches!
            </p>
            <button
              onClick={() => router.push('/matches')}
              className="btn-primary"
            >
              View My Matches
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
