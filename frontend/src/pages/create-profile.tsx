import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useProfile } from '@/hooks/useProfile';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';
import { FiArrowLeft } from 'react-icons/fi';

export default function CreateProfile() {
  const { address, isConnected } = useAccount();
  const { hasProfile, createProfile, isCreating } = useProfile(address);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    interests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (hasProfile) {
      toast.error('You already have a profile');
      router.push('/profile');
      return;
    }

    const age = parseInt(formData.age);
    if (age < 18) {
      toast.error('You must be 18 or older');
      return;
    }

    try {
      // For demo purposes, using a placeholder IPFS URI
      // In production, you would upload the image to IPFS first
      const tokenURI = `ipfs://placeholder-${Date.now()}`;

      await createProfile(
        formData.name,
        age,
        formData.bio,
        formData.interests,
        tokenURI
      );

      toast.success('Profile created successfully!');
      router.push('/explore');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error?.message || 'Failed to create profile');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to create a profile
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="card">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Create Your Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Tell us about yourself. This will be stored on the blockchain.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="input"
                placeholder="Must be 18 or older"
                min="18"
                max="120"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input min-h-[120px]"
                placeholder="Tell us about yourself..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests *
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="input"
                placeholder="e.g., hiking, photography, travel"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple interests with commas
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your profile will be minted as a soulbound NFT on the
                blockchain. This means it cannot be transferred to another wallet.
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
