# 🤝 Guía de Contribución

## Estructura del Proyecto

### Smart Contracts (`/contracts`)

```
contracts/
├── contracts/          # Archivos .sol
├── scripts/           # Scripts de deployment
├── test/             # Tests unitarios
└── hardhat.config.js # Configuración de Hardhat
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/   # Componentes reutilizables
│   ├── hooks/       # Custom hooks de Web3
│   ├── lib/         # Configuraciones y utilidades
│   ├── pages/       # Páginas de Next.js
│   └── styles/      # Estilos globales
└── public/          # Assets estáticos
```

## Agregar Nuevas Funcionalidades

### 1. Nuevo Smart Contract

```bash
# Crear archivo en contracts/contracts/
touch contracts/contracts/NuevoContrato.sol

# Agregar test
touch contracts/test/NuevoContrato.test.js

# Actualizar deploy script
# Editar contracts/scripts/deploy.js
```

### 2. Nueva Página en Frontend

```bash
# Crear página
touch frontend/src/pages/nueva-pagina.tsx

# Opcional: crear componente
touch frontend/src/components/NuevoComponente.tsx
```

### 3. Nuevo Hook de Web3

```bash
# Crear hook
touch frontend/src/hooks/useNuevaFuncionalidad.ts

# Agregar ABI en lib/contracts.ts si es necesario
```

## Convenciones de Código

### Solidity

- Usar Solidity ^0.8.20
- Seguir [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Documentar con NatSpec comments
- Optimizar para gas
- Siempre usar SafeMath implícito (^0.8.0)

```solidity
/**
 * @dev Función que hace X
 * @param _param Descripción del parámetro
 * @return Descripción del retorno
 */
function miFuncion(uint256 _param) public returns (uint256) {
    // código
}
```

### TypeScript/React

- Usar TypeScript estricto
- Functional components con hooks
- Named exports para componentes
- Props interface para cada componente

```typescript
interface MiComponenteProps {
  titulo: string;
  onClick?: () => void;
}

export function MiComponente({ titulo, onClick }: MiComponenteProps) {
  // código
}
```

### CSS/Tailwind

- Usar clases de Tailwind cuando sea posible
- Clases personalizadas en globals.css para reutilizar
- Mobile-first approach

## Testing

### Smart Contracts

```bash
cd contracts
npm run test

# Con coverage
npm run test -- --coverage

# Test específico
npm run test -- test/ProfileNFT.test.js
```

### Frontend (TODO)

```bash
cd frontend
npm run test
```

## Deployment

### Testnet

```bash
cd contracts
npm run deploy:testnet
```

### Mainnet (¡CUIDADO!)

```bash
npm run deploy
```

## Git Workflow

### Branches

- `main` - Producción
- `develop` - Desarrollo
- `feature/nombre` - Nueva feature
- `fix/nombre` - Bug fix

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar sistema de mensajería
fix: corregir bug en matching
docs: actualizar README
style: formatear código
refactor: refactorizar ProfileCard
test: agregar tests para MatchSystem
chore: actualizar dependencias
```

### Pull Requests

1. Fork el repo
2. Crear branch: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: agregar mi feature'`
4. Push: `git push origin feature/mi-feature`
5. Abrir PR con descripción detallada

## Roadmap de Features

### Fase 1 - MVP ✅
- [x] ProfileNFT contract
- [x] MatchSystem contract
- [x] VerificationSystem contract
- [x] Frontend básico
- [x] Create profile UI
- [x] Explore/swipe UI
- [x] Matches UI

### Fase 2 - ZK Integration 🚧
- [ ] Implementar zk-SNARKs para verificaciones
- [ ] Integrar con Polygon ID o similar
- [ ] Privacy-preserving age verification
- [ ] Background check con ZK

### Fase 3 - IPFS & Media
- [ ] Subir imágenes a IPFS
- [ ] NFT metadata en IPFS
- [ ] Galería de fotos por perfil
- [ ] Video profiles

### Fase 4 - Messaging
- [ ] Encrypted messaging contract
- [ ] XMTP integration
- [ ] Push notifications
- [ ] Message history on-chain

### Fase 5 - Social Features
- [ ] Reputation system
- [ ] Reviews/ratings
- [ ] Social graph
- [ ] Group events
- [ ] Video calls integration

### Fase 6 - Advanced
- [ ] AI matching algorithm
- [ ] Tokenomics (dating token)
- [ ] DAO governance
- [ ] Multi-chain support

## Issues & Bugs

Reportar en [GitHub Issues](link) con:

- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots si aplica
- Versión de Node.js, navegador, etc.

## Preguntas

- Discord: [Link]
- Telegram: [Link]
- Email: [Contact]

## Licencia

MIT - ver [LICENSE](LICENSE)

## Agradecimientos

- Syscoin team
- OpenZeppelin
- Hardhat
- Next.js
- RainbowKit
- Comunidad Web3

---

¡Gracias por contribuir! 💖
