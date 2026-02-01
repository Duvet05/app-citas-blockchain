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
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">💫</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Cupido PoDA
          </h1>
        </div>
        <ConnectButton />
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Sistema de Karma Social
            <br />
            en Blockchain
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Reconoce y registra comportamientos positivos en interacciones sociales.
            Sin datos personales. Solo acciones. On-chain.
          </p>

          <div>
            <ConnectButton />
            <p className="mt-4 text-sm text-gray-500">
              Conecta con Pali Wallet, MetaMask o cualquier wallet Web3
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reconocimiento P2P</h3>
              <p className="text-gray-600">
                Los usuarios se reconocen mutuamente por interacciones positivas. Cuesta gas (anti-spam).
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sin Datos Personales</h3>
              <p className="text-gray-600">
                No validamos quién eres. Validamos qué tipo de interacciones elegís sostener.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Karma Acumulativo</h3>
              <p className="text-gray-600">
                Las buenas acciones se registran on-chain como NFTs soulbound. Portables y verificables.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Built on Rollux (Syscoin L2) | Proof of Builders Hackathon 2026 🇵🇪</p>
      </footer>
    </div>
  );
}
