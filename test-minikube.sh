#!/bin/bash

set -e

STACK_NUM=1
PROFILE_NAME="cupido-stack$STACK_NUM"

echo "========================================="
echo "🚀 Creando Stack $STACK_NUM con Minikube"
echo "========================================="
echo ""

# Eliminar si existe
minikube delete -p $PROFILE_NAME 2>/dev/null || true

# Crear cluster
echo "📦 Creando cluster minikube..."
minikube start -p $PROFILE_NAME \
    --driver=docker \
    --cpus=2 \
    --memory=2048

# Cargar imágenes
echo "📥 Cargando imágenes en minikube..."
minikube -p $PROFILE_NAME image load cupido-hardhat:latest
minikube -p $PROFILE_NAME image load cupido-frontend:latest

# Usar contexto
kubectl config use-context $PROFILE_NAME

# Crear namespace
echo "📁 Creando namespace..."
kubectl create namespace cupido-stack$STACK_NUM

# Desplegar Hardhat
echo "⛓️  Desplegando Hardhat..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hardhat
  namespace: cupido-stack$STACK_NUM
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hardhat
  template:
    metadata:
      labels:
        app: hardhat
    spec:
      containers:
      - name: hardhat
        image: cupido-hardhat:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 8545
---
apiVersion: v1
kind: Service
metadata:
  name: hardhat
  namespace: cupido-stack$STACK_NUM
spec:
  type: NodePort
  selector:
    app: hardhat
  ports:
  - port: 8545
    targetPort: 8545
    nodePort: 30000
EOF

# Esperar Hardhat
echo "⏳ Esperando Hardhat..."
kubectl wait --for=condition=ready pod -l app=hardhat -n cupido-stack$STACK_NUM --timeout=120s

sleep 5

# Desplegar Frontend
echo "🌐 Desplegando Frontend..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: cupido-stack$STACK_NUM
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: cupido-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_CHAIN_ID
          value: "31337"
        - name: NEXT_PUBLIC_RPC_URL
          value: "http://hardhat:8545"
        - name: NEXT_PUBLIC_PROFILE_NFT_ADDRESS
          value: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"
        - name: NEXT_PUBLIC_MATCH_SYSTEM_ADDRESS
          value: "0x9A676e781A523b5d0C0e43731313A708CB607508"
        - name: NEXT_PUBLIC_VERIFICATION_SYSTEM_ADDRESS
          value: "0x0B306BF915C4d645ff596e518fAf3F9669b97016"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: cupido-stack$STACK_NUM
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30100
EOF

# Obtener URLs
echo ""
echo "========================================="
echo "✅ Stack $STACK_NUM creado!"
echo "========================================="
echo ""

FRONTEND_URL=$(minikube -p $PROFILE_NAME service frontend -n cupido-stack$STACK_NUM --url)
HARDHAT_URL=$(minikube -p $PROFILE_NAME service hardhat -n cupido-stack$STACK_NUM --url)

echo "🌐 Frontend: $FRONTEND_URL"
echo "⛓️  Hardhat:  $HARDHAT_URL"
echo ""
echo "Estado de pods:"
kubectl get pods -n cupido-stack$STACK_NUM
echo ""
echo "========================================="
