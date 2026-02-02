#!/bin/bash

NAMESPACE=$1

if [ -z "$NAMESPACE" ]; then
  echo "Uso: $0 <namespace>"
  exit 1
fi

echo "Desplegando contratos en $NAMESPACE..."

# Obtener el nombre del pod de hardhat
HARDHAT_POD=$(kubectl get pod -n $NAMESPACE -l app=hardhat -o jsonpath='{.items[0].metadata.name}')

if [ -z "$HARDHAT_POD" ]; then
  echo "Error: No se encontró el pod de hardhat en $NAMESPACE"
  exit 1
fi

echo "Pod de hardhat: $HARDHAT_POD"

# Desplegar contratos
echo "Desplegando contratos..."
DEPLOY_OUTPUT=$(kubectl exec -n $NAMESPACE $HARDHAT_POD -- npx hardhat run scripts/deployLocal.js --network localhost)

echo "$DEPLOY_OUTPUT"

# Extraer direcciones de los contratos
PROFILE_NFT=$(echo "$DEPLOY_OUTPUT" | grep "ProfileNFT desplegado en:" | awk '{print $NF}')
MATCH_SYSTEM=$(echo "$DEPLOY_OUTPUT" | grep "MatchSystem desplegado en:" | awk '{print $NF}')
VERIFICATION=$(echo "$DEPLOY_OUTPUT" | grep "VerificationSystem desplegado en:" | awk '{print $NF}')

echo ""
echo "Direcciones de contratos:"
echo "ProfileNFT: $PROFILE_NFT"
echo "MatchSystem: $MATCH_SYSTEM"
echo "VerificationSystem: $VERIFICATION"

# Actualizar variables de entorno en el deployment del frontend
echo ""
echo "Actualizando variables de entorno en frontend..."
kubectl set env deployment/frontend -n $NAMESPACE \
  NEXT_PUBLIC_PROFILE_NFT_ADDRESS=$PROFILE_NFT \
  NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS=$MATCH_SYSTEM \
  NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS=$VERIFICATION

echo "¡Despliegue completado!"
