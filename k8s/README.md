# 🚀 Kubernetes Local - App de Citas Blockchain

## ✅ Estado Actual

Tienes **DOS instancias completas** corriendo en Kubernetes local (Minikube):

### Stack 1 (cupido-stack1)
- **Frontend:** http://localhost:3001
- **Contratos desplegados:**
  - ProfileNFT: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`
  - MatchSystem: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
  - VerificationSystem: `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`

### Stack 2 (cupido-stack2)
- **Frontend:** http://localhost:3002
- **Contratos desplegados:**
  - ProfileNFT: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
  - MatchSystem: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
  - VerificationSystem: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

## 🔧 Configuración de MetaMask

Para probar con wallets diferentes:

1. **Agregar red personalizada en MetaMask:**
   - Network Name: `Hardhat Local Stack 1`
   - RPC URL: `http://localhost:8501` (si lo expones con port-forward)
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Importar una wallet de Hardhat:**
   Las wallets de demo ya tienen perfiles creados:
   - Alice: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Bob: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - Carol: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - David: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`

   Private keys disponibles en los logs de Hardhat:
   ```bash
   kubectl logs -n cupido-stack1 -l app=hardhat | grep "Private Key"
   ```

## 🧪 Testing

Cada stack es **completamente independiente**:
- Tienen sus propios contratos desplegados
- Tienen su propio nodo de Hardhat
- Puedes conectar diferentes wallets a cada uno
- Perfecto para probar interacciones entre usuarios

## 📝 Scripts Útiles

```bash
# Ver el estado completo
./k8s/status.sh

# Desplegar contratos en un stack
./k8s/deploy-contracts.sh cupido-stack1
./k8s/deploy-contracts.sh cupido-stack2

# Reinicar todo desde cero
minikube delete
./k8s/setup-local.sh

# Ver logs
kubectl logs -n cupido-stack1 -l app=frontend --tail=50
kubectl logs -n cupido-stack2 -l app=hardhat --tail=50
```

## 🌐 Port-forwards activos

Los siguientes procesos están corriendo en background:
- Stack 1 Frontend: `localhost:3001 -> cupido-stack1/frontend:3000`
- Stack 2 Frontend: `localhost:3002 -> cupido-stack2/frontend:3000`

Para exponera Hardhat (opcional):
```bash
kubectl port-forward -n cupido-stack1 svc/hardhat 8501:8545 &
kubectl port-forward -n cupido-stack2 svc/hardhat 8502:8545 &
```

## 🎯 Próximos pasos

1. Abre http://localhost:3001 en un navegador
2. Abre http://localhost:3002 en otro navegador (o ventana incógnito)
3. Conecta diferentes wallets de MetaMask en cada uno
4. ¡Prueba el sistema de matching entre dos usuarios reales!

## 🛑 Detener todo

```bash
# Detener Minikube (mantiene los datos)
minikube stop

# Eliminar todo
minikube delete
```
