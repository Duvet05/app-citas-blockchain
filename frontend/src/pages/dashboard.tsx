import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Send, Education as EducationIcon, UserMultiple } from '@carbon/icons-react';
import KarmaScore from '../components/KarmaScore';
import { useProfile } from '../hooks/useProfile';
import { useMatches } from '../hooks/useMatches';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { hasProfile, profile, createProfile, isCreating: profileLoading } = useProfile();
  const { likeProfile, matches } = useMatches();

  const [recognitionAddress, setRecognitionAddress] = useState('');
  const [isGivingRecognition, setIsGivingRecognition] = useState(false);

  // Redirect si no está conectado
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // Auto-crear perfil si no existe
  useEffect(() => {
    if (isConnected && !hasProfile && !profileLoading) {
      handleCreateProfile();
    }
  }, [isConnected, hasProfile, profileLoading]);

  const handleCreateProfile = async () => {
    try {
      await createProfile(
        address || 'Anon',
        25,
        'Participante del sistema de karma',
        'blockchain,karma,syscoin',
        ''
      );
      toast.success('¡Perfil creado! Bienvenido al sistema de karma');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Error al crear perfil');
    }
  };

  const handleGiveRecognition = async () => {
    if (!recognitionAddress || !recognitionAddress.startsWith('0x')) {
      toast.error('Por favor ingresa una dirección válida');
      return;
    }

    setIsGivingRecognition(true);
    try {
      await likeProfile(recognitionAddress as `0x${string}`);
      toast.success('¡Reconocimiento enviado!');
      setRecognitionAddress('');
    } catch (error: any) {
      console.error('Error giving recognition:', error);
      toast.error(error.message || 'Error al dar reconocimiento');
    } finally {
      setIsGivingRecognition(false);
    }
  };

  // Calcular karma score simple (sin smart contract por ahora)
  const karmaScore = matches.length * 15 + (profile?.isActive ? 50 : 0);
  const recognitionsReceived = matches.filter(m => m.user2 === address).length;
  const recognitionsGiven = matches.filter(m => m.user1 === address).length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Conecta tu wallet para continuar</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💫 Cupido PoDA</h1>
            <p className="text-sm text-gray-600">Sistema de Karma Social</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Karma Score */}
          <div className="lg:col-span-1">
            <KarmaScore
              score={karmaScore}
              recognitionsReceived={recognitionsReceived}
              recognitionsGiven={recognitionsGiven}
              modulesCompleted={0}
              participationCount={profile?.isActive ? 1 : 0}
            />

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/explore')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                >
                  <UserMultiple size={20} />
                  <span className="text-sm font-medium">Explorar Perfiles</span>
                </button>
                <button
                  onClick={() => router.push('/matches')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                >
                  <Send size={20} />
                  <span className="text-sm font-medium">Ver Reconocimientos</span>
                </button>
                <button
                  disabled
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  <EducationIcon size={20} />
                  <span className="text-sm font-medium">Módulos Educativos (Próximamente)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dar Reconocimiento */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Dar Reconocimiento
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Reconoce a alguien que tuvo una interacción positiva contigo.
                El reconocimiento cuesta gas (anti-spam).
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... (dirección de wallet)"
                  value={recognitionAddress}
                  onChange={(e) => setRecognitionAddress(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleGiveRecognition}
                  disabled={isGivingRecognition || !recognitionAddress}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send size={20} />
                  {isGivingRecognition ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>

            {/* Reconocimientos Mutuos */}
            {matches.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Reconocimientos Mutuos
                </h2>
                <div className="space-y-3">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Reconocimiento mutuo con
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {match.user1 === address ? match.user2 : match.user1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(Number(match.timestamp) * 1000).toLocaleDateString()}
                        </p>
                        <span className="text-sm font-medium text-purple-600">
                          +15 karma
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {matches.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">💫</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aún no tienes reconocimientos
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza dando reconocimientos a otros usuarios o explora perfiles
                </p>
                <button
                  onClick={() => router.push('/explore')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Explorar Perfiles
                </button>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                ¿Cómo funciona el Karma?
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Participación:</strong> 1 punto por cada día activo (máx 100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Recibir reconocimiento:</strong> 10 puntos cada uno</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>Dar reconocimiento:</strong> 5 puntos cada uno</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span><strong>Módulos educativos:</strong> 20 puntos cada uno</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
