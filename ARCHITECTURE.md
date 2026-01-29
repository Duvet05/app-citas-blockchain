# 🏗️ Arquitectura del Sistema

## Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Next.js + TypeScript                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │  Pages   │  │Components│  │  Hooks   │         │   │
│  │  │          │  │          │  │          │         │   │
│  │  │ • index  │  │ • Profile│  │ • use    │         │   │
│  │  │ • explore│  │   Card   │  │   Profile│         │   │
│  │  │ • matches│  │ • Navbar │  │ • use    │         │   │
│  │  │ • profile│  │          │  │   Matches│         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Web3 Integration Layer                        │   │
│  │  Wagmi v2 + RainbowKit + Viem                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JSON-RPC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Syscoin Blockchain                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Smart Contracts                         │   │
│  │                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐              │   │
│  │  │  ProfileNFT   │  │  MatchSystem  │              │   │
│  │  │               │  │               │              │   │
│  │  │ • ERC-721     │  │ • likes       │              │   │
│  │  │ • Soulbound   │  │ • matches     │              │   │
│  │  │ • Profiles    │  │ • getMatches  │              │   │
│  │  └───────────────┘  └───────────────┘              │   │
│  │                                                       │   │
│  │  ┌────────────────────────┐                         │   │
│  │  │  VerificationSystem    │                         │   │
│  │  │                        │                         │   │
│  │  │ • trusted verifiers    │                         │   │
│  │  │ • grant/revoke         │                         │   │
│  │  │ • isVerified           │                         │   │
│  │  └────────────────────────┘                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Crear Perfil

```
User                Frontend              ProfileNFT Contract
 │                     │                          │
 │  1. Fill form       │                          │
 ├────────────────────>│                          │
 │                     │                          │
 │  2. Connect wallet  │                          │
 ├────────────────────>│                          │
 │                     │                          │
 │  3. Sign tx        │  4. createProfile()      │
 ├────────────────────>├─────────────────────────>│
 │                     │                          │
 │                     │  5. Mint NFT             │
 │                     │<─────────────────────────│
 │                     │  ProfileCreated event    │
 │                     │                          │
 │  6. Redirect to     │                          │
 │     explore         │                          │
 │<────────────────────┤                          │
```

### 2. Like Profile

```
User A              Frontend            MatchSystem Contract
 │                     │                          │
 │  1. Swipe right     │                          │
 ├────────────────────>│                          │
 │                     │                          │
 │  2. Sign tx        │  3. likeProfile(B)       │
 ├────────────────────>├─────────────────────────>│
 │                     │                          │
 │                     │  4. Check if B likes A   │
 │                     │<─────────────────────────│
 │                     │                          │
 │                     │  5. If yes, create match │
 │                     │     MatchCreated event   │
 │  6. Show "Match!"   │                          │
 │<────────────────────┤                          │
```

### 3. Verificación

```
Verifier            VerificationSystem        User
 │                          │                   │
 │  1. grantVerification()  │                   │
 ├─────────────────────────>│                   │
 │                          │                   │
 │                          │  2. Update state  │
 │                          │                   │
 │                          │  3. Emit event    │
 │                          ├──────────────────>│
 │                          │  VerificationGranted
 │                          │                   │
 │                          │  4. Badge appears │
 │                          │     on profile    │
```

## Componentes del Sistema

### Smart Contracts

#### ProfileNFT.sol
```solidity
Responsibilities:
- Mint único perfil por wallet (soulbound)
- Almacenar metadata del perfil
- Gestionar estado activo/inactivo
- Prevenir transferencias

Key Functions:
- createProfile()
- updateProfile()
- deactivateProfile()
- getProfileByAddress()

Storage:
- mapping(address => uint256) addressToProfile
- mapping(uint256 => ProfileData) profiles
- Counters.Counter _tokenIdCounter
```

#### MatchSystem.sol
```solidity
Responsibilities:
- Gestionar likes entre usuarios
- Crear matches cuando hay mutualidad
- Tracking de matches activos
- Permitir unmatch

Key Functions:
- likeProfile()
- unmatch()
- getActiveMatches()
- isMatch()

Storage:
- mapping(address => mapping(address => bool)) likes
- Match[] matches
- mapping(address => uint256[]) userMatches
```

#### VerificationSystem.sol
```solidity
Responsibilities:
- Gestionar verifiers autorizados
- Otorgar/revocar verificaciones
- Verificar atributos de usuarios
- Tracking de expiraciones

Key Functions:
- addVerifier()
- grantVerification()
- revokeVerification()
- isVerified()

Storage:
- mapping(address => mapping(VerificationType => Verification)) verifications
- mapping(address => bool) isVerifier
```

### Frontend Architecture

#### Páginas

```typescript
/                    // Landing page
/create-profile      // Crear perfil nuevo
/explore            // Swipear perfiles
/matches            // Ver matches
/profile            // Ver/editar mi perfil
```

#### Custom Hooks

```typescript
useProfile(address)
- hasProfile: boolean
- profile: Profile | null
- createProfile()
- updateProfile()

useMatches(address)
- matches: Match[]
- likeProfile()
- unmatch()
- receivedLikes: Address[]
- sentLikes: Address[]

useVerifications(address)
- verifications: Verification[]
- isVerified()
```

#### State Management

```
Zustand Store (futuro)
├── User State
│   ├── address
│   ├── profile
│   └── verifications
├── App State
│   ├── currentPage
│   ├── loading
│   └── errors
└── Match State
    ├── matches
    ├── likes
    └── currentProfile
```

## Seguridad

### Smart Contracts

1. **Access Control**
   - Ownable para funciones admin
   - onlyVerifier modifier
   - Verificación de ownership en updates

2. **Input Validation**
   - Age >= 18 check
   - Address != 0 checks
   - Profile existence checks

3. **Reentrancy Protection**
   - No external calls en funciones críticas
   - Checks-Effects-Interactions pattern

4. **Gas Optimization**
   - Storage packing
   - Minimal loops
   - Event emission para indexing

### Frontend

1. **Wallet Security**
   - RainbowKit para conexión segura
   - Verificación de red correcta
   - User confirmation en cada tx

2. **Input Sanitization**
   - Validación de formularios
   - XSS prevention
   - Type safety con TypeScript

## Escalabilidad

### Current Limits
- Profiles: Unlimited (cada usuario puede tener 1)
- Matches: ~10M (gas-efficient storage)
- Verifications: 6 tipos por usuario

### Optimizations
1. **Indexing**
   - Usar The Graph para queries
   - Event-based tracking
   - Off-chain profile discovery

2. **Storage**
   - IPFS para imágenes
   - Minimal on-chain data
   - Metadata en URI

3. **Caching**
   - React Query para Web3 calls
   - Local storage para UX
   - Optimistic updates

## Monitoring & Analytics

### On-chain Metrics
```javascript
- Total Profiles Created
- Total Matches
- Active Users (daily/weekly)
- Verification Rate
- Like → Match Conversion
```

### Events to Track
```solidity
ProfileCreated(owner, tokenId, name)
ProfileUpdated(tokenId, name, bio)
LikeGiven(liker, liked, timestamp)
MatchCreated(user1, user2, matchId, timestamp)
VerificationGranted(user, type, verifier, timestamp)
```

## Future Enhancements

### Phase 2: ZK Integration
```
┌────────────┐        ┌──────────────┐        ┌─────────────┐
│   User     │───────>│ ZK Circuit   │───────>│  Contract   │
│            │ prove  │              │ verify │             │
│ • Age = 25 │        │ age >= 18 ?  │        │ isVerified  │
│ • Single   │        │ status = 1 ? │        │             │
└────────────┘        └──────────────┘        └─────────────┘
                      (Circom/SnarkJS)
```

### Phase 3: Decentralized Storage
```
┌─────────┐        ┌──────────┐        ┌────────────┐
│ Upload  │───────>│   IPFS   │───────>│ NFT.Storage│
│ Image   │        │  Gateway │        │            │
└─────────┘        └──────────┘        └────────────┘
                         │
                         ▼
                   ┌──────────┐
                   │ Profile  │
                   │   NFT    │
                   │ (tokenURI)
                   └──────────┘
```

### Phase 4: Messaging
```
┌─────────┐        ┌──────────┐        ┌─────────┐
│ User A  │◄──────►│   XMTP   │◄──────►│ User B  │
│         │ E2E    │  Protocol│  E2E   │         │
└─────────┘        └──────────┘        └─────────┘
                         │
                         ▼
                   ┌──────────┐
                   │  Match   │
                   │ Contract │
                   │(required)│
                   └──────────┘
```

## Tech Stack Summary

### Blockchain
- **Network**: Syscoin (EVM-compatible)
- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Libraries**: OpenZeppelin Contracts

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi v2 + Viem
- **Wallet**: RainbowKit
- **State**: React Hooks (+ Zustand future)

### Tools
- **Testing**: Chai + Mocha
- **Deployment**: Hardhat scripts
- **IPFS**: (Future) Pinata/NFT.Storage
- **Indexing**: (Future) The Graph

---

**Última actualización**: 2026-01-29
