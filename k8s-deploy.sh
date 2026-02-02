#!/bin/bash

# Script para desplegar múltiples stacks con Kubernetes (k3d)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "☸️  Cupido PoDA - Kubernetes Multi Stack"
echo "========================================"
echo ""

# Verificar k3d
if ! command -v k3d &> /dev/null; then
    echo "${YELLOW}⚠️  k3d no está instalado${NC}"
    echo ""
    echo "Instalando k3d..."
    curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
fi

# Verificar kubectl
if ! command -v kubectl &> /dev/null; then
    echo "${RED}❌ kubectl no está instalado${NC}"
    echo "Instala kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

show_menu() {
    echo ""
    echo "Opciones:"
    echo ""
    echo "  ${GREEN}1)${NC} Crear Stack 1 (cluster: cupido-1, puerto 3000)"
    echo "  ${GREEN}2)${NC} Crear Stack 2 (cluster: cupido-2, puerto 3001)"
    echo "  ${YELLOW}3)${NC} Crear AMBOS stacks"
    echo "  ${BLUE}4)${NC} Ver estado"
    echo "  ${BLUE}5)${NC} Ver logs Stack 1"
    echo "  ${BLUE}6)${NC} Ver logs Stack 2"
    echo "  ${RED}7)${NC} Eliminar Stack 1"
    echo "  ${RED}8)${NC} Eliminar Stack 2"
    echo "  ${RED}9)${NC} Eliminar AMBOS"
    echo "  0) Salir"
    echo ""
}

build_images() {
    echo "${YELLOW}📦 Construyendo imágenes Docker...${NC}"
    docker build -f Dockerfile.hardhat -t cupido-hardhat:latest .
    docker build -f Dockerfile.frontend -t cupido-frontend:latest .
    echo "${GREEN}✅ Imágenes construidas${NC}"
}

create_stack() {
    local STACK_NUM=$1
    local CLUSTER_NAME="cupido-$STACK_NUM"
    local HTTP_PORT=$((3000 + STACK_NUM - 1))
    local RPC_PORT=$((8545 + STACK_NUM - 1))

    echo ""
    echo "${GREEN}▶ Creando Stack $STACK_NUM...${NC}"
    echo "  Cluster: $CLUSTER_NAME"
    echo "  Frontend: http://localhost:$HTTP_PORT"
    echo "  Hardhat: http://localhost:$RPC_PORT"
    echo ""

    # Crear cluster k3d
    k3d cluster create $CLUSTER_NAME \
        -p "$HTTP_PORT:30000@loadbalancer" \
        -p "$RPC_PORT:30001@loadbalancer" \
        --agents 0

    # Importar imágenes
    k3d image import cupido-hardhat:latest -c $CLUSTER_NAME
    k3d image import cupido-frontend:latest -c $CLUSTER_NAME

    # Deploy
    kubectl create namespace cupido-stack$STACK_NUM || true
    kubectl config set-context --current --namespace=cupido-stack$STACK_NUM

    # Aplicar manifests con puertos ajustados
    cat k8s/hardhat-deployment.yaml | \
        sed "s/nodePort:.*/nodePort: 30001/" | \
        kubectl apply -f - -n cupido-stack$STACK_NUM

    cat k8s/frontend-deployment.yaml | \
        sed "s/nodePort:.*/nodePort: 30000/" | \
        kubectl apply -f - -n cupido-stack$STACK_NUM

    echo ""
    echo "${GREEN}✅ Stack $STACK_NUM creado${NC}"
    echo "  Accede en: http://localhost:$HTTP_PORT"
    echo "  RPC en: http://localhost:$RPC_PORT"
}

show_status() {
    echo ""
    echo "${BLUE}📊 Clusters activos:${NC}"
    k3d cluster list

    echo ""
    echo "${BLUE}📊 Pods en Stack 1:${NC}"
    kubectl get pods -n cupido-stack1 2>/dev/null || echo "  Stack 1 no existe"

    echo ""
    echo "${BLUE}📊 Pods en Stack 2:${NC}"
    kubectl get pods -n cupido-stack2 2>/dev/null || echo "  Stack 2 no existe"
}

show_logs() {
    local STACK_NUM=$1
    echo ""
    echo "${BLUE}📜 Logs Stack $STACK_NUM:${NC}"
    echo ""
    kubectl logs -n cupido-stack$STACK_NUM -l app=frontend --tail=50 -f
}

delete_stack() {
    local STACK_NUM=$1
    echo ""
    echo "${RED}🗑️  Eliminando Stack $STACK_NUM...${NC}"
    k3d cluster delete cupido-$STACK_NUM
    echo "${GREEN}✅ Stack $STACK_NUM eliminado${NC}"
}

# Construir imágenes al inicio
if [ ! "$(docker images -q cupido-hardhat:latest 2> /dev/null)" ]; then
    build_images
fi

# Menu loop
while true; do
    show_menu
    read -p "Selecciona opción: " choice

    case $choice in
        1) create_stack 1 ;;
        2) create_stack 2 ;;
        3) create_stack 1 && create_stack 2 ;;
        4) show_status ;;
        5) show_logs 1 ;;
        6) show_logs 2 ;;
        7) delete_stack 1 ;;
        8) delete_stack 2 ;;
        9) delete_stack 1 && delete_stack 2 ;;
        0) echo "👋 Adiós!"; exit 0 ;;
        *) echo "${RED}Opción inválida${NC}" ;;
    esac

    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
