# 🚀 Guía Rápida de Deployment - Syscoin Hackathon

## ⚡ Quick Start (5 minutos)

### 1. Preparar Wallet

```bash
# Asegúrate de tener:
# ✅ MetaMask instalado
# ✅ Testnet SYS tokens (del faucet)
# ✅ Private key lista (sin 0x)
```

### 2. Configurar Proyecto

```bash
# Clonar e instalar
git clone <repo-url>
cd app-citas-blockchain
npm install
cd contracts && npm install && cd ..
cd frontend && npm install && cd ..

# Configurar .env
echo "PRIVATE_KEY=tu_private_key_sin_0x" > .env
```

### 3. Deploy Contratos

```bash
cd contracts
npm run deploy:testnet

# ⚠️ IMPORTANTE: Copia las 3 direcciones que aparecen
# ProfileNFT: 0x...
# MatchSystem: 0x...
# VerificationSystem: 0x...
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Crear .env.local
cat > .env.local << EOF
NEXT_PUBLIC_CHAIN_ID=5700
NEXT_PUBLIC_PROFILE_NFT_ADDRESS=0x_ADDRESS_AQUI
NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS=0x_ADDRESS_AQUI
NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS=0x_ADDRESS_AQUI
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
EOF
```

### 5. Ejecutar App

```bash
npm run dev
# Abrir http://localhost:3000
```

## 🎯 Checklist Pre-Demo

- [ ] Contratos desplegados en Syscoin Testnet
- [ ] Direcciones actualizadas en frontend/.env.local
- [ ] Frontend corriendo en localhost:3000
- [ ] MetaMask conectado a Syscoin Testnet
- [ ] Wallet tiene SYS tokens
- [ ] Perfil de prueba creado
- [ ] Al menos 1 match de prueba creado

## 📋 Scripts Útiles

```bash
# Compilar contratos
cd contracts && npm run compile

# Ejecutar tests
npm run test

# Deploy en testnet
npm run deploy:testnet

# Deploy en mainnet (¡cuidado!)
npm run deploy

# Desarrollo frontend
cd frontend && npm run dev

# Build frontend para producción
npm run build && npm start
```

## 🔗 Enlaces Importantes

### Syscoin Testnet (Tanenbaum)
- **Chain ID**: 5700
- **RPC**: https://rpc.tanenbaum.io
- **Explorer**: https://tanenbaum.io
- **Faucet**: [Link al faucet]

### Syscoin Mainnet
- **Chain ID**: 57
- **RPC**: https://rpc.syscoin.org
- **Explorer**: https://explorer.syscoin.org

## 🛠️ Comandos de Emergencia

### Reset todo

```bash
# Limpiar build
rm -rf contracts/cache contracts/artifacts
rm -rf frontend/.next

# Reinstalar
npm run compile
cd frontend && npm run dev
```

### Cambiar de red

```bash
# Editar contracts/hardhat.config.js
# Cambiar defaultNetwork: "syscoinTestnet"

# Editar frontend/.env.local
# NEXT_PUBLIC_CHAIN_ID=5700  # testnet
# NEXT_PUBLIC_CHAIN_ID=57    # mainnet
```

## 🎬 Demo Script

### Para Jueces/Presentación

1. **Mostrar Landing** (30 seg)
   - Explicar problema: fake profiles, unsafe dates
   - Solución: blockchain verification

2. **Crear Perfil** (1 min)
   - Connect wallet
   - Fill form: nombre, edad, bio, interests
   - Confirmar tx en MetaMask
   - Mostrar NFT creado on-chain

3. **Explorar Perfiles** (1 min)
   - Swipear 2-3 perfiles
   - Dar like a uno
   - Explicar: cada like es tx on-chain

4. **Mostrar Match** (30 seg)
   - Si hay match mutuo, mostrar notificación
   - Ir a "My Matches"
   - Mostrar match verificado on-chain

5. **Verificaciones** (30 seg)
   - Ir a perfil
   - Mostrar badges de verificación
   - Explicar ZK-proofs (futuro)

**Total: ~3.5 minutos**

## 📊 Métricas para Presentar

```javascript
// Obtener del blockchain durante demo
- Total Profiles Created: X
- Total Matches: Y
- Total Likes Given: Z
- Transactions on Testnet: N
```

## 🎨 Capturas para Slides

Tomar screenshots de:
- [ ] Landing page
- [ ] Create profile form
- [ ] Profile card (swipe view)
- [ ] Matches page
- [ ] User profile page
- [ ] Block explorer (tx confirmada)

## 🔥 Features para Destacar

### En la Presentación

1. **Soulbound NFTs**: Perfiles no transferibles
2. **On-chain Matching**: Transparencia total
3. **Privacy-First**: ZK-proofs (roadmap)
4. **UX Familiar**: Like Tinder pero Web3
5. **Syscoin Native**: EVM-compatible, low fees

### Ventajas vs Tinder/Bumble

| Feature | Tinder | Web3 Dating |
|---------|--------|-------------|
| Fake Profiles | ⚠️ Común | ✅ Impossible |
| Verified Users | 💰 Premium | ✅ On-chain |
| Data Privacy | ❌ Vendido | ✅ ZK-proofs |
| Transparency | ❌ Opaco | ✅ Blockchain |
| Match Proof | ❌ Centralized | ✅ Verifiable |

## 🚨 Problemas Comunes

### "Transaction Underpriced"
```javascript
// Aumentar gas en hardhat.config.js
gasPrice: 1000000000 // 1 gwei
```

### "Nonce too low"
```bash
# Reset MetaMask
Settings → Advanced → Reset Account
```

### "Contract not deployed"
```bash
# Verificar deployment
cd contracts
cat deployments/syscoinTestnet.json
```

## 📝 Notas para la Presentación

### Elevator Pitch (30 seg)

> "Web3 Dating es la primera app de citas donde la confianza está garantizada por blockchain. Verificamos identidades usando zero-knowledge proofs, sin exponer datos personales. Cada perfil es un NFT soulbound, cada match es on-chain. No más fake profiles, no más unsafe dates. Built on Syscoin."

### Pain Points que Resolvemos

1. **Fake Profiles** → Soulbound NFTs
2. **Data Breaches** → Self-custody
3. **Unsafe Dates** → Verified backgrounds
4. **Catfishing** → Identity verification
5. **Privacy Concerns** → ZK-proofs

### Roadmap (si preguntan)

- ✅ MVP: Basic profiles + matching (DONE)
- 🚧 Phase 2: Real ZK-proof integration
- 🔜 Phase 3: IPFS for images
- 🔜 Phase 4: Encrypted messaging
- 🔜 Phase 5: Reputation system

## 🎯 Target Metrics

Para ganar la hackathon, optimizar para:

- ✅ **C1**: Built in < 1 week
- ✅ **C3**: UX ≤ 2 min to play
- ✅ **C8**: High testnet activity
- ✅ **C9**: Clear demo surface

## 📞 Emergency Contacts

- **Tech Issues**: [Discord/Telegram]
- **Syscoin Support**: [Official channel]
- **Team Lead**: [Contact info]

---

## ✅ Final Checklist Día de Demo

**Mañana del Demo:**
- [ ] Laptop cargada
- [ ] Internet estable (backup: hotspot)
- [ ] MetaMask con testnet tokens
- [ ] Contratos desplegados y funcionando
- [ ] Frontend en localhost corriendo
- [ ] 2-3 wallets de prueba listas
- [ ] Screenshots preparadas
- [ ] Slides listos
- [ ] Pitch ensayado

**30 min antes:**
- [ ] Crear perfil de demo
- [ ] Hacer 2-3 matches de prueba
- [ ] Test completo de todas las features
- [ ] Backup: grabar video del demo

---

**¡Buena suerte! 🚀💖**
