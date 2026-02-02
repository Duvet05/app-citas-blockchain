#!/bin/bash

# Script para gestionar múltiples stacks

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "🚀 Cupido PoDA - Multi Stack Manager"
echo "========================================"
echo ""

show_menu() {
    echo "Opciones:"
    echo ""
    echo "  ${GREEN}1)${NC} Levantar Stack 1 (puertos 8545, 3000)"
    echo "  ${GREEN}2)${NC} Levantar Stack 2 (puertos 8546, 3001)"
    echo "  ${YELLOW}3)${NC} Levantar AMBOS stacks"
    echo "  ${BLUE}4)${NC} Ver estado de los stacks"
    echo "  ${RED}5)${NC} Detener Stack 1"
    echo "  ${RED}6)${NC} Detener Stack 2"
    echo "  ${RED}7)${NC} Detener AMBOS stacks"
    echo "  ${RED}8)${NC} Limpiar todo (borrar datos)"
    echo "  0) Salir"
    echo ""
}

start_stack1() {
    echo ""
    echo "${GREEN}▶ Iniciando Stack 1...${NC}"
    echo "  Hardhat: http://localhost:8545"
    echo "  Frontend: http://localhost:3000"
    echo ""
    docker-compose -f docker-compose.stack1.yml up -d --build
    echo ""
    echo "${GREEN}✅ Stack 1 iniciado${NC}"
}

start_stack2() {
    echo ""
    echo "${GREEN}▶ Iniciando Stack 2...${NC}"
    echo "  Hardhat: http://localhost:8546"
    echo "  Frontend: http://localhost:3001"
    echo ""
    docker-compose -f docker-compose.stack2.yml up -d --build
    echo ""
    echo "${GREEN}✅ Stack 2 iniciado${NC}"
}

start_both() {
    echo ""
    echo "${YELLOW}▶ Iniciando AMBOS stacks...${NC}"
    echo ""
    echo "Stack 1:"
    echo "  Hardhat: http://localhost:8545"
    echo "  Frontend: http://localhost:3000"
    echo ""
    echo "Stack 2:"
    echo "  Hardhat: http://localhost:8546"
    echo "  Frontend: http://localhost:3001"
    echo ""

    docker-compose -f docker-compose.stack1.yml up -d --build
    docker-compose -f docker-compose.stack2.yml up -d --build

    echo ""
    echo "${GREEN}✅ Ambos stacks iniciados${NC}"
}

show_status() {
    echo ""
    echo "${BLUE}📊 Estado de los Stacks:${NC}"
    echo ""

    echo "Stack 1:"
    docker-compose -f docker-compose.stack1.yml ps

    echo ""
    echo "Stack 2:"
    docker-compose -f docker-compose.stack2.yml ps
    echo ""
}

stop_stack1() {
    echo ""
    echo "${RED}⏹ Deteniendo Stack 1...${NC}"
    docker-compose -f docker-compose.stack1.yml down
    echo "${GREEN}✅ Stack 1 detenido${NC}"
}

stop_stack2() {
    echo ""
    echo "${RED}⏹ Deteniendo Stack 2...${NC}"
    docker-compose -f docker-compose.stack2.yml down
    echo "${GREEN}✅ Stack 2 detenido${NC}"
}

stop_both() {
    echo ""
    echo "${RED}⏹ Deteniendo AMBOS stacks...${NC}"
    docker-compose -f docker-compose.stack1.yml down
    docker-compose -f docker-compose.stack2.yml down
    echo "${GREEN}✅ Ambos stacks detenidos${NC}"
}

clean_all() {
    echo ""
    echo "${RED}🗑️  Limpiando todo (esto borrará los datos)...${NC}"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.stack1.yml down -v
        docker-compose -f docker-compose.stack2.yml down -v
        echo "${GREEN}✅ Todo limpiado${NC}"
    else
        echo "Cancelado"
    fi
}

show_instructions() {
    echo ""
    echo "========================================="
    echo "📖 CÓMO USAR MÚLTIPLES STACKS"
    echo "========================================="
    echo ""
    echo "${GREEN}Stack 1:${NC}"
    echo "  Hardhat RPC:  http://localhost:8545"
    echo "  Frontend:     http://localhost:3000"
    echo ""
    echo "${BLUE}Stack 2:${NC}"
    echo "  Hardhat RPC:  http://localhost:8546"
    echo "  Frontend:     http://localhost:3001"
    echo ""
    echo "Configurar MetaMask:"
    echo ""
    echo "  ${GREEN}Para Stack 1:${NC}"
    echo "    - RPC: http://localhost:8545"
    echo "    - Chain ID: 31337"
    echo ""
    echo "  ${BLUE}Para Stack 2:${NC}"
    echo "    - RPC: http://localhost:8546"
    echo "    - Chain ID: 31337"
    echo ""
    echo "Wallet de prueba (misma para ambos):"
    echo "  Address:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    echo "  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo ""
    echo "💡 Cada stack tiene su propia blockchain independiente"
    echo "========================================="
    echo ""
}

# Loop principal
while true; do
    show_menu
    read -p "Selecciona una opción: " choice

    case $choice in
        1) start_stack1 ;;
        2) start_stack2 ;;
        3) start_both ;;
        4) show_status ;;
        5) stop_stack1 ;;
        6) stop_stack2 ;;
        7) stop_both ;;
        8) clean_all ;;
        0) echo "👋 Adiós!"; exit 0 ;;
        *) echo "${RED}Opción inválida${NC}" ;;
    esac

    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
