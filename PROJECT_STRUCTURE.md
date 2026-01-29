# 📁 Estructura del Proyecto

```
app-citas-blockchain/
│
├── 📄 README.md                    # Documentación principal
├── 📄 DEPLOYMENT_GUIDE.md          # Guía de deployment
├── 📄 ARCHITECTURE.md              # Arquitectura del sistema
├── 📄 CONTRIBUTING.md              # Guía para contribuidores
├── 📄 PROJECT_STRUCTURE.md         # Este archivo
├── 📄 QUICK_START.sh               # Script de inicio rápido
│
├── 📄 package.json                 # Root package (workspace)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Template para variables de entorno
│
├── 📁 contracts/                   # 🔗 Smart Contracts (Hardhat)
│   ├── 📄 package.json
│   ├── 📄 hardhat.config.js        # Configuración de Hardhat
│   ├── 📄 .env.example             # Template de .env
│   │
│   ├── 📁 contracts/               # Archivos Solidity
│   │   ├── 📄 ProfileNFT.sol       # ✅ NFT de perfiles (soulbound)
│   │   ├── 📄 MatchSystem.sol      # ✅ Sistema de likes y matches
│   │   └── 📄 VerificationSystem.sol # ✅ Verificaciones de identidad
│   │
│   ├── 📁 scripts/                 # Scripts de deployment
│   │   └── 📄 deploy.js            # ✅ Deploy a Syscoin
│   │
│   ├── 📁 test/                    # Tests unitarios
│   │   └── 📄 ProfileNFT.test.js   # ✅ Tests de ProfileNFT
│   │
│   ├── 📁 deployments/             # Direcciones deployadas (generado)
│   │   └── syscoinTestnet.json     # (Se crea al deployar)
│   │
│   ├── 📁 cache/                   # Cache de Hardhat (auto-generado)
│   └── 📁 artifacts/               # ABIs compilados (auto-generado)
│
└── 📁 frontend/                    # 🎨 Frontend (Next.js)
    ├── 📄 package.json
    ├── 📄 next.config.js           # Configuración de Next.js
    ├── 📄 tsconfig.json            # Configuración de TypeScript
    ├── 📄 tailwind.config.js       # Configuración de Tailwind
    ├── 📄 postcss.config.js        # PostCSS config
    ├── 📄 .env.local.example       # Template de .env.local
    │
    ├── 📁 public/                  # Assets estáticos
    │   └── 📄 favicon.ico
    │
    └── 📁 src/                     # Código fuente
        │
        ├── 📁 components/          # ⚛️ Componentes React
        │   └── 📄 ProfileCard.tsx  # ✅ Card de perfil para swipe
        │
        ├── 📁 hooks/               # 🪝 Custom Hooks Web3
        │   ├── 📄 useProfile.ts    # ✅ Hook para perfiles
        │   └── 📄 useMatches.ts    # ✅ Hook para matches
        │
        ├── 📁 lib/                 # 🔧 Configuraciones y utilidades
        │   ├── 📄 wagmi.ts         # ✅ Config Wagmi/RainbowKit
        │   └── 📄 contracts.ts     # ✅ ABIs y addresses
        │
        ├── 📁 pages/               # 📄 Páginas de Next.js
        │   ├── 📄 _app.tsx         # ✅ App wrapper con providers
        │   ├── 📄 index.tsx        # ✅ Landing page
        │   ├── 📄 create-profile.tsx # ✅ Crear perfil
        │   ├── 📄 explore.tsx      # ✅ Explorar perfiles (swipe)
        │   ├── 📄 matches.tsx      # ✅ Ver matches
        │   └── 📄 profile.tsx      # ✅ Ver/editar mi perfil
        │
        └── 📁 styles/              # 🎨 Estilos
            └── 📄 globals.css      # ✅ Estilos globales + Tailwind
```

## ✅ Archivos Implementados

### Smart Contracts (3/3)
- ✅ ProfileNFT.sol - ERC-721 soulbound para perfiles
- ✅ MatchSystem.sol - Sistema de likes y matches
- ✅ VerificationSystem.sol - Verificaciones de identidad

### Frontend Pages (5/5)
- ✅ index.tsx - Landing page con hero y features
- ✅ create-profile.tsx - Formulario de creación de perfil
- ✅ explore.tsx - Swipear perfiles estilo Tinder
- ✅ matches.tsx - Ver todos los matches
- ✅ profile.tsx - Ver y editar mi perfil

### Frontend Components (1+)
- ✅ ProfileCard.tsx - Card reutilizable para mostrar perfiles

### Custom Hooks (2/2)
- ✅ useProfile.ts - Gestión de perfiles (create, update, get)
- ✅ useMatches.ts - Gestión de matches (like, unmatch, get)

### Configuration (8/8)
- ✅ hardhat.config.js - Configuración Syscoin
- ✅ next.config.js - Configuración Next.js
- ✅ tsconfig.json - TypeScript config
- ✅ tailwind.config.js - Tailwind customization
- ✅ wagmi.ts - Web3 provider config
- ✅ contracts.ts - ABIs y addresses
- ✅ package.json (root, contracts, frontend)
- ✅ .env.example files

### Scripts & Deployment (2/2)
- ✅ deploy.js - Script de deployment
- ✅ QUICK_START.sh - Script de setup

### Tests (1/3)
- ✅ ProfileNFT.test.js
- ⏳ MatchSystem.test.js (TODO)
- ⏳ VerificationSystem.test.js (TODO)

### Documentation (5/5)
- ✅ README.md - Documentación completa
- ✅ DEPLOYMENT_GUIDE.md - Guía de deployment
- ✅ ARCHITECTURE.md - Arquitectura del sistema
- ✅ CONTRIBUTING.md - Guía de contribución
- ✅ PROJECT_STRUCTURE.md - Esta estructura

## 📊 Estadísticas del Proyecto

```
Total de Archivos:        ~30 archivos
Líneas de Código:         ~3,500 LOC
  - Solidity:             ~800 LOC
  - TypeScript/React:     ~1,500 LOC
  - Config/Scripts:       ~300 LOC
  - Documentation:        ~900 LOC

Smart Contracts:          3 contratos
Frontend Pages:           5 páginas
Components:               1+ componentes
Custom Hooks:             2 hooks
Tests:                    1 test file
```

## 🎯 Funcionalidades Implementadas

### ✅ Core Features
- [x] Conexión de wallet con RainbowKit
- [x] Creación de perfiles (NFT soulbound)
- [x] Actualización de perfiles
- [x] Exploración de perfiles (swipe UI)
- [x] Sistema de likes
- [x] Matching automático (mutual likes)
- [x] Visualización de matches
- [x] Sistema de verificaciones (MVP)
- [x] UI responsive mobile-first
- [x] Deployment en Syscoin Testnet

### ⏳ Próximas Features
- [ ] Tests completos (MatchSystem, VerificationSystem)
- [ ] IPFS para imágenes de perfil
- [ ] ZK-proofs para verificaciones
- [ ] Sistema de mensajería
- [ ] Búsqueda y filtros avanzados
- [ ] Sistema de reputación
- [ ] Notificaciones push

## 🚀 Cómo Usar Esta Estructura

### 1. Setup Inicial
```bash
# Ejecutar quick start
./QUICK_START.sh

# O manual:
npm install
cd contracts && npm install
cd ../frontend && npm install
```

### 2. Desarrollo
```bash
# Terminal 1: Contracts (local)
cd contracts
npx hardhat node

# Terminal 2: Deploy (local)
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 3. Producción (Testnet)
```bash
# 1. Deploy contracts
cd contracts
npm run deploy:testnet

# 2. Copiar addresses a frontend/.env.local

# 3. Run frontend
cd ../frontend
npm run dev
```

## 📝 Convenciones de Nombres

### Archivos
- **Componentes**: PascalCase (`ProfileCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useProfile.ts`)
- **Páginas**: kebab-case (`create-profile.tsx`)
- **Contratos**: PascalCase (`ProfileNFT.sol`)
- **Scripts**: camelCase (`deploy.js`)

### Código
- **Variables**: camelCase (`isActive`)
- **Constantes**: UPPER_SNAKE_CASE (`CONTRACT_ADDRESSES`)
- **Funciones**: camelCase (`likeProfile()`)
- **Interfaces**: PascalCase con sufijo `Props` (`ProfileCardProps`)
- **Types**: PascalCase (`Profile`, `Match`)

## 🔍 Dónde Encontrar Cada Cosa

| Necesitas... | Ve a... |
|--------------|---------|
| ABIs de contratos | `frontend/src/lib/contracts.ts` |
| Direcciones deployadas | `contracts/deployments/` |
| Configuración de red | `contracts/hardhat.config.js` |
| Config de Wagmi | `frontend/src/lib/wagmi.ts` |
| Estilos globales | `frontend/src/styles/globals.css` |
| Variables de entorno | `.env` y `frontend/.env.local` |
| Scripts de deploy | `contracts/scripts/deploy.js` |
| Instrucciones | `README.md` y `DEPLOYMENT_GUIDE.md` |

## 🛠️ Tecnologías por Carpeta

### `/contracts`
- Hardhat
- Solidity ^0.8.20
- OpenZeppelin Contracts
- Ethers.js v6
- Mocha + Chai (testing)

### `/frontend`
- Next.js 14
- TypeScript
- TailwindCSS
- Wagmi v2
- Viem
- RainbowKit
- React Hot Toast
- Framer Motion (futuro)

## 📦 Gestión de Dependencias

```json
// Root workspace
"workspaces": ["frontend", "contracts"]

// Instalar en todos
npm install

// Instalar solo en contracts
npm install --workspace=contracts

// Instalar solo en frontend
npm install --workspace=frontend
```

## 🎨 Flujo de Trabajo Típico

```bash
1. Modificar contrato → contracts/contracts/
2. Compilar → npm run compile
3. Testear → npm run test
4. Deployar → npm run deploy:testnet
5. Copiar address → frontend/.env.local
6. Actualizar ABI → frontend/src/lib/contracts.ts
7. Usar en hook → frontend/src/hooks/
8. Crear componente → frontend/src/components/
9. Agregar a página → frontend/src/pages/
10. Test manual → npm run dev
```

---

**Proyecto completo y listo para la hackathon! 🚀💖**
