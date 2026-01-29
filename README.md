# 💖 Web3 Dating App - Syscoin Hackathon 2026

Una dApp de citas Web3 orientada a la seguridad y la confianza, que utiliza blockchain para verificar identidades sin comprometer la privacidad.

## 🎯 Características Principales

- **Perfiles NFT Soulbound**: Cada perfil es un NFT único que no puede ser transferido
- **Sistema de Matches On-chain**: Likes y matches verificables en blockchain
- **Verificación de Identidad**: Sistema de verificaciones usando ZK-proofs (MVP usa trusted verifiers)
- **UI Tipo Tinder**: Interfaz intuitiva para explorar perfiles
- **100% Transparente**: Todas las acciones verificables en Syscoin blockchain

## 🏗️ Arquitectura del Proyecto

```
app-citas-blockchain/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── ProfileNFT.sol           # NFT de perfiles (soulbound)
│   │   ├── MatchSystem.sol          # Sistema de likes y matches
│   │   └── VerificationSystem.sol   # Verificaciones de identidad
│   ├── scripts/
│   │   └── deploy.js
│   ├── test/
│   └── hardhat.config.js
│
└── frontend/              # Frontend (Next.js + TypeScript)
    ├── src/
    │   ├── components/    # Componentes React
    │   ├── hooks/         # Custom hooks para Web3
    │   ├── lib/           # Configuración Wagmi/RainbowKit
    │   ├── pages/         # Páginas de Next.js
    │   └── styles/        # Estilos Tailwind
    └── package.json
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js v18+ y npm
- MetaMask u otra wallet Web3
- SYS testnet tokens (obtener del faucet)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd app-citas-blockchain
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar dependencias de contratos
cd contracts
npm install
cd ..

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Private key para deployment (SIN el prefijo 0x)
PRIVATE_KEY=tu_private_key_aqui

# URLs de RPC (opcional, usa los defaults)
SYSCOIN_TESTNET_RPC=https://rpc.tanenbaum.io
SYSCOIN_MAINNET_RPC=https://rpc.syscoin.org
```

Crear archivo `frontend/.env.local`:

```bash
cd frontend
cp .env.local.example .env.local
```

Editar `frontend/.env.local`:

```env
NEXT_PUBLIC_CHAIN_ID=5700
NEXT_PUBLIC_CHAIN_NAME="Syscoin Tanenbaum Testnet"
NEXT_PUBLIC_RPC_URL=https://rpc.tanenbaum.io

# Estos se actualizan después del deployment
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=
NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS=
NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS=

# WalletConnect (opcional, obtener de https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

## 📝 Deployment de Smart Contracts

### 1. Compilar Contratos

```bash
cd contracts
npm run compile
```

### 2. Ejecutar Tests (Opcional)

```bash
npm run test
```

### 3. Deploy en Syscoin Testnet

```bash
npm run deploy:testnet
```

Esto desplegará los 3 contratos:
- ProfileNFT
- MatchSystem
- VerificationSystem

**Importante**: Guarda las direcciones de los contratos desplegados.

### 4. Actualizar Frontend con Direcciones

Copia las direcciones de los contratos y actualiza `frontend/.env.local`:

```env
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0x...
NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS=0x...
```

## 🎨 Ejecutar el Frontend

```bash
cd frontend
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Uso de la Aplicación

### 1. Conectar Wallet

- Haz clic en "Connect Wallet"
- Conecta MetaMask
- Asegúrate de estar en Syscoin Tanenbaum Testnet (Chain ID: 5700)

### 2. Crear Perfil

- Haz clic en "Create Your Profile"
- Completa el formulario:
  - Nombre (display name)
  - Edad (18+)
  - Biografía
  - Intereses (separados por comas)
- Confirma la transacción en MetaMask
- Espera la confirmación

### 3. Explorar Perfiles

- Una vez creado tu perfil, serás redirigido a `/explore`
- Swipea perfiles:
  - ❌ Pasar (X)
  - ❤️ Like (corazón)
- Si hay match mutuo, se creará automáticamente

### 4. Ver Matches

- Haz clic en el menú (☰) → "My Matches"
- Verás todos tus matches confirmados on-chain

### 5. Ver Tu Perfil

- Menú → "My Profile"
- Edita tu perfil (actualiza bio, intereses, etc.)

## 🔐 Sistema de Verificaciones

El contrato `VerificationSystem` permite verificar:

- ✅ **IDENTITY**: Identidad real verificada
- ✅ **AGE**: Mayor de 18 años
- ✅ **MARITAL_STATUS**: Estado civil (soltero/a)
- ✅ **BACKGROUND_CHECK**: Sin antecedentes penales
- ✅ **EDUCATION**: Credenciales educativas
- ✅ **EMPLOYMENT**: Estado laboral

### Agregar Verificador (Solo Owner)

```javascript
// Desde Hardhat console o script
const verificationSystem = await ethers.getContractAt("VerificationSystem", ADDRESS);
await verificationSystem.addVerifier("0xVerifierAddress");
```

### Otorgar Verificación (Como Verifier)

```javascript
// VerificationType: 0=IDENTITY, 1=AGE, 2=MARITAL_STATUS, etc.
await verificationSystem.grantVerification(
  "0xUserAddress",
  0, // IDENTITY
  0  // expiresAt (0 = no expira)
);
```

## 📦 Estructura de Contratos

### ProfileNFT.sol

```solidity
// Funciones principales
createProfile(name, age, bio, interests, tokenURI)
updateProfile(name, bio, interests, tokenURI)
deactivateProfile()
reactivateProfile()
getProfileByAddress(address) → Profile
```

### MatchSystem.sol

```solidity
// Funciones principales
likeProfile(address)
unmatch(address)
getActiveMatches(address) → Match[]
isMatch(address, address) → bool
getReceivedLikes() → address[]
getSentLikes() → address[]
```

### VerificationSystem.sol

```solidity
// Funciones principales
grantVerification(user, type, expiresAt)
revokeVerification(user, type)
isVerified(user, type) → bool
getUserVerifications(user) → (types[], statuses[], timestamps[])
```

## 🎯 Criterios de Hackathon

### ✅ Cumplimiento

| Criterio | Estado | Notas |
|----------|--------|-------|
| C1 - Buildable in 1 week | ✅ | 3 contratos simples + UI básica |
| C2 - Standard EVM only | ✅ | Solidity + OpenZeppelin |
| C3 - UX-first (≤2 min) | ✅ | Connect → Create → Play |
| C4 - Fun + repeatable | ✅ | Swipe mecánica + matches |
| C5 - Meaningful on-chain | ✅ | Mint + Like + Match on-chain |
| C6 - Avoid complexity | ✅ | No oracles, no heavy backend |
| C7 - DevNet → Mainnet ready | ✅ | Mismo código, solo redeploy |
| C8 - Generates testnet activity | ✅ | Multiple tx per user |
| C9 - Clear judging surface | ✅ | Explorer links + eventos |

## 🧪 Testing Local

### 1. Red Local Hardhat

```bash
# Terminal 1: Levantar nodo local
cd contracts
npx hardhat node

# Terminal 2: Deploy en local
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 2. Configurar MetaMask para Local

- Network: localhost
- RPC: http://127.0.0.1:8545
- Chain ID: 1337
- Importar una de las cuentas de prueba que proporciona Hardhat

## 🔍 Verificación de Contratos (Opcional)

Si Syscoin tiene block explorer compatible:

```bash
npx hardhat verify --network syscoinTestnet CONTRACT_ADDRESS [CONSTRUCTOR_ARGS]
```

## 📚 Stack Tecnológico

### Smart Contracts
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Wagmi v2
- RainbowKit
- Viem
- React Hot Toast
- Framer Motion

### Blockchain
- Syscoin (EVM-compatible)
- Testnet: Tanenbaum (Chain ID: 5700)
- Mainnet: Syscoin (Chain ID: 57)

## 🎨 Diseño y UX

### Paleta de Colores

```css
/* Gradientes principales */
from-pink-500 to-purple-600  /* Primary gradient */
from-pink-50 via-purple-50 to-blue-50  /* Background */

/* Colores de verificación */
green-100/green-800  /* Verified badge */
yellow-100/yellow-800  /* Pending badge */
```

### Tipografía

- Font: Inter (sistema sans-serif)
- Pesos: 400 (regular), 600 (semibold), 700 (bold)

## 🚨 Notas Importantes

### Seguridad

⚠️ **NUNCA** commitear el archivo `.env` con tu private key
⚠️ **SOLO** usar wallets de testnet durante desarrollo
⚠️ El sistema de verificación MVP usa "trusted verifiers" - en producción usar ZK-proofs

### Limitaciones MVP

- Imágenes de perfil son placeholders (en producción usar IPFS)
- Verificaciones usan trusted verifiers (no ZK-proofs aún)
- Lista de perfiles es simulada (en producción indexar blockchain)
- No hay chat/mensajería (futura implementación)

### Gas Optimization

Los contratos están optimizados para:
- Minimizar storage writes
- Usar eventos para indexación off-chain
- Evitar loops en funciones view cuando sea posible

## 🤝 Contribuir

Este es un proyecto de hackathon. Para mejoras futuras:

1. Implementar ZK-proofs reales para verificaciones
2. Agregar IPFS para imágenes de perfil
3. Sistema de mensajería encriptada
4. Indexer (The Graph) para query de perfiles
5. Sistema de reputación on-chain
6. Integración con oráculos para verificaciones externas

## 📄 Licencia

MIT License

## 👥 Equipo

**A ver que se nos ocurre Team**

- Sandra
- Liz
- Viví
- Pilar
- Mely

Desarrollado para Syscoin Hackathon 2026 🚀

---

## 🆘 Troubleshooting

### Error: "Profile already exists"
- Solo puedes crear un perfil por wallet
- Usa otra wallet o edita tu perfil existente

### Error: "Must be 18 or older"
- La edad mínima es 18 años (validación on-chain)

### MetaMask no conecta
- Verifica que estés en Syscoin Tanenbaum Testnet
- Chain ID: 5700
- RPC: https://rpc.tanenbaum.io

### Transacciones fallan
- Asegúrate de tener SYS tokens en testnet
- Faucet: [Obtener testnet tokens]

### Frontend no muestra perfiles
- Verifica que las direcciones de contratos estén en `.env.local`
- Asegúrate de haber desplegado los contratos primero
- Revisa la consola del navegador para errores

## 📞 Soporte

Para issues: [GitHub Issues](https://github.com/...)
Discord: [Link al servidor de hackathon]

---

**¡Buena suerte en la hackathon! 💖🚀**
