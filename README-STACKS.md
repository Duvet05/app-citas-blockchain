# Stacks Docker Compose

Configuración de dos stacks completamente independientes para pruebas de wallets.

## Estructura

- **Stack 1**: Red `cupido-network-1`, puertos 8545 (Hardhat) y 3001 (Frontend)
- **Stack 2**: Red `cupido-network-2`, puertos 8546 (Hardhat) y 3002 (Frontend)

Cada stack tiene su propio blockchain Hardhat y contratos desplegados de forma independiente.

## Uso

### Levantar ambos stacks

```bash
# Stack 1
docker-compose -f docker-compose.stack1.yml up -d

# Stack 2
docker-compose -f docker-compose.stack2.yml up -d
```

### Desplegar contratos (si es necesario)

```bash
# Stack 1
docker-compose -f docker-compose.stack1.yml up deploy-1

# Stack 2
docker-compose -f docker-compose.stack2.yml up deploy-2
```

### Ver logs

```bash
# Frontend Stack 1
docker logs cupido-frontend-1 --follow

# Frontend Stack 2
docker logs cupido-frontend-2 --follow

# Hardhat Stack 1
docker logs cupido-hardhat-1 --tail 50

# Hardhat Stack 2
docker logs cupido-hardhat-2 --tail 50
```

### Detener stacks

```bash
docker-compose -f docker-compose.stack1.yml down
docker-compose -f docker-compose.stack2.yml down
```

## Acceso

- **Stack 1 Frontend**: http://localhost:3001
- **Stack 2 Frontend**: http://localhost:3002
- **Stack 1 RPC**: http://localhost:8545
- **Stack 2 RPC**: http://localhost:8546

## Contratos desplegados

Ambos stacks usan las mismas direcciones (porque cada Hardhat es independiente):

- **ProfileNFT**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **MatchSystem**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **VerificationSystem**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## Cuentas de prueba (Hardhat)

Ambos stacks tienen las mismas 20 cuentas con 10,000 ETH cada una:

- **Account #0**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

(Ver logs de Hardhat para todas las cuentas)

## Configurar MetaMask

1. Agregar red personalizada:
   - **Stack 1**: RPC URL `http://localhost:8545`, Chain ID `31337`
   - **Stack 2**: RPC URL `http://localhost:8546`, Chain ID `31337`
2. Importar cuenta usando una de las private keys de Hardhat
3. Probar transacciones en ambos stacks

## Notas

- Los stacks están completamente aislados en redes Docker separadas
- Cada stack tiene su propio estado de blockchain
- La primera carga puede tardar 20-30 segundos mientras Next.js compila
