import { useProfile } from '@/hooks/useProfile';
import { Address } from 'viem';
import { FiMapPin, FiCalendar, FiCheckCircle } from 'react-icons/fi';

interface ProfileCardProps {
  address: Address;
}

export function ProfileCard({ address }: ProfileCardProps) {
  const { profile, hasProfile } = useProfile(address);

  if (!hasProfile || !profile) {
    return (
      <div className="card animate-pulse">
        <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const interests = profile.interests.split(',').map(i => i.trim()).filter(Boolean);

  return (
    <div className="card overflow-hidden">
      {/* Profile Image Placeholder */}
      <div className="aspect-[3/4] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 text-white text-6xl font-bold">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        {profile.isActive && (
          <div className="absolute top-4 right-4 z-10">
            <div className="badge-verified flex items-center gap-1">
              <FiCheckCircle className="text-green-600" />
              Active
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <FiCalendar className="text-sm" />
            <span>{Number(profile.age)} years old</span>
          </div>
        </div>

        {profile.bio && (
          <p className="text-gray-700">{profile.bio}</p>
        )}

        {interests.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Interests</h3>
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
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Profile #{Number(profile.tokenId)} • On-chain since{' '}
            {new Date(Number(profile.createdAt) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
