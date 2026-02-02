# 💫 Cupido PoDA - Sistema de Karma Social

**Sistema de reputación on-chain para reconocimiento de comportamientos positivos**

Proof of Builders Hackathon - Syscoin Perú 🇵🇪 2026

---

## 🚀 Quick Start

### Opción A: Docker (Recomendado - Todo en 1 comando)

```bash
docker-compose up --build
```

Abre http://localhost:3000 y configura MetaMask (ver [DOCKER.md](DOCKER.md))

### Opción B: Manual

```bash
# Terminal 1: Hardhat node
cd contracts && npx hardhat node

# Terminal 2: Frontend
cd frontend && npm run dev
```

Luego configura MetaMask con Hardhat Local (Chain ID 31337)

**📖 Ver [DEMO-HACKATHON.md](DEMO-HACKATHON.md) para instrucciones completas.**
**🐳 Ver [DOCKER.md](DOCKER.md) para setup con Docker y acceso desde red local.**

---

## 🎯 El Proyecto

**Cupido PoDA** registra comportamientos positivos en interacciones sociales usando blockchain:

- **Karma Acumulativo**: Acciones positivas registradas como NFTs soulbound
- **Reconocimiento P2P**: Usuarios reconocen interacciones positivas mutuamente
- **Sin Datos Personales**: Solo se registran acciones, no identidades
- **UI estilo Reddit**: Dashboard de karma con Carbon Design System

## ✨ Features Implementadas

- ✅ **Perfiles NFT Soulbound** - Un perfil por wallet, no transferible
- ✅ **Sistema de Reconocimientos** - Dar y recibir karma
- ✅ **Cálculo Dinámico de Karma** - Basado en interacciones on-chain
- ✅ **UI con Carbon Design System** - Componentes estilo Reddit
- ✅ **Testing Completo** - 55/55 tests passing (100%)
- ✅ **Listo para Syscoin NEVM** - Solo requiere fondos de testnet

## 🏗️ Arquitectura

```
app-citas-blockchain/
├── contracts/
│   ├── contracts/
│   │   ├── ProfileNFT.sol           # Perfiles de karma (soulbound)
│   │   ├── MatchSystem.sol          # Reconocimientos P2P
│   │   └── VerificationSystem.sol   # Badges y educación
│   ├── scripts/
│   │   ├── deploy.js                # Deployment a testnet
│   │   ├── deployLocal.js           # Deployment local con datos demo
│   │   ├── seed.js                  # Crear datos de prueba
│   │   └── verifyWallet.js          # Verificar balance
│   ├── test/                        # 55 tests (100% passing)
│   └── hardhat.config.js            # Syscoin NEVM + Rollux + Local
│
└── frontend/                        # Next.js 14 + TypeScript
    ├── src/
    │   ├── pages/
    │   │   ├── index.tsx            # Landing page
    │   │   └── dashboard.tsx        # Dashboard de karma
    │   ├── components/
    │   │   └── KarmaScore.tsx       # Componente de karma (Carbon UI)
    │   ├── hooks/
    │   │   ├── useProfile.ts        # Hook para perfiles
    │   │   └── useMatches.ts        # Hook para reconocimientos
    │   └── lib/
    │       └── wagmi.ts             # Config Web3 (RainbowKit)
    └── .env.local                   # Config de red y contratos
```

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install
cd contracts && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Configurar .env (ver .env de ejemplo)
cp .env.example .env

# 3. Compilar y testear contratos
cd contracts
npm run compile
npm test  # 55/55 tests passing

# 4. Deploy local para demo
npx hardhat node  # Terminal 1
npm run deployLocal  # Terminal 2

# 5. Frontend
cd ../frontend
npm run dev  # http://localhost:3000
```

## 🧪 Testing

```bash
cd contracts
npm test
```

**Resultado:**
```
55 passing (100%)

ProfileNFT Tests: 19/19 ✅
MatchSystem Tests: 18/18 ✅
VerificationSystem Tests: 18/18 ✅
```

## 🌐 Networks Configuradas

**Hardhat Local (Demo):**
- Chain ID: 31337
- RPC: http://127.0.0.1:8545
- Deployment: [deployments-local.json](contracts/deployments-local.json)

**Syscoin NEVM Testnet (Tanenbaum):**
- Chain ID: 5700
- RPC: https://rpc.tanenbaum.io
- Faucet: https://faucet.tanenbaum.io
- Deploy: `npm run deploy:syscoin`

**Rollux Testnet (Layer 2):**
- Chain ID: 57000
- RPC: https://rollux.rpc.tanenbaum.io
- Deploy: `npm run deploy:rollux`

## 📝 Smart Contracts

### ProfileNFT.sol
Perfiles de karma como NFTs soulbound (no transferibles).

```solidity
createProfile(name, age, bio, interests, tokenURI)
updateProfile(name, bio, interests, tokenURI)
deactivateProfile() / reactivateProfile()
getProfileByAddress(address) → Profile
```

### MatchSystem.sol
Sistema de reconocimientos peer-to-peer con detección de matches mutuos.

```solidity
likeProfile(address)           // Dar reconocimiento
unmatch(address)               // Eliminar match
getActiveMatches(address)      // Ver matches
isMatch(address, address)      // Verificar match mutuo
```

### VerificationSystem.sol
Sistema de badges educativos y verificaciones.

```solidity
addVerifier(address)                    // Solo owner
grantVerification(user, type, expires)  // Solo verifiers
isVerified(user, type) → bool
getUserVerifications(user) → (types[], statuses[], timestamps[])
```

## 🎨 Stack Tecnológico

**Blockchain:**
- Solidity 0.8.20
- Hardhat (development & testing)
- OpenZeppelin Contracts 5.0.1
- Ethers.js v6

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- RainbowKit + Wagmi v2 (Web3)
- Carbon Design System (UI)
- TailwindCSS (styling)
- React Hot Toast (notifications)

## 📊 Deployment Status

| Network | Status | Contracts |
|---------|--------|-----------|
| Hardhat Local | ✅ Deployed | Ver [deployments-local.json](contracts/deployments-local.json) |
| Syscoin NEVM Testnet | ⏳ Pending | Esperando fondos de faucet |
| Rollux Testnet | ⏳ Pending | Esperando fondos de faucet |

## 👥 Equipo: Cupido PoDA

- Sandra Ortiz
- Lizeth Sucasaca
- Viviana Cortez
- Pilar Virillas
- Juan Carlos Mujica
- Gonzalo Galvez (Developer)
- Mely Hidalgo
- Camilla Arredondo

**Wallet del Equipo:** `0x8AC69d1e78b3CED95289662fd2ca6b4E187434AC`

Desarrollado para **Proof of Builders** - Syscoin Hackathon Perú 🇵🇪 2026

---

## 📞 Recursos

**Documentación:**
- [DEMO-HACKATHON.md](DEMO-HACKATHON.md) - Guía completa de demo
- [Syscoin Docs](https://docs.syscoin.org)

**Hackathon:**
- Proof of Builders Forum: https://pob.syscoin.org/forum
- Discord: https://discord.gg/syscoin

---

## 🆘 Troubleshooting

**MetaMask no conecta a Hardhat Local:**
- Network: Hardhat Local
- RPC: http://127.0.0.1:8545
- Chain ID: 31337
- Importar wallet de prueba (ver DEMO-HACKATHON.md)

**Frontend no muestra datos:**
- Verifica que Hardhat node esté corriendo
- Verifica addresses en `frontend/.env.local`
- Revisa consola del navegador para errores

**Tests fallan:**
- `cd contracts && npm install`
- `npx hardhat clean`
- `npm test`

---

**Built with ❤️ on Syscoin | Cupido PoDA Team 2026 🚀**
