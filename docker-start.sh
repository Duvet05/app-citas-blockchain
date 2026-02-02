#!/bin/bash

# Script de inicio rápido para Docker

echo "========================================"
echo "🐳 Cupido PoDA - Docker Setup"
echo "========================================"
echo ""

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo ""
    echo "Instala Docker primero:"
    echo "  Linux: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    echo "  macOS/Windows: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    echo ""
    echo "Instala Docker Compose:"
    echo "  sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "  sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo "✅ Docker instalado: $(docker --version)"
echo "✅ Docker Compose instalado: $(docker-compose --version)"
echo ""

# Obtener IP local
IP=$(hostname -I | awk '{print $1}')
if [ -z "$IP" ]; then
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
fi

echo "📡 Tu IP local: $IP"
echo ""
echo "Acceso desde esta computadora:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  ⛓️  Hardhat:  http://localhost:8545"
echo ""
echo "Acceso desde otras computadoras en la red:"
echo "  🌐 Frontend: http://$IP:3000"
echo "  ⛓️  Hardhat:  http://$IP:8545"
echo ""
echo "========================================"
echo ""

# Preguntar modo
read -p "¿Iniciar en modo background? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Iniciando en background..."
    docker-compose up -d --build

    echo ""
    echo "✅ Servicios iniciados"
    echo ""
    echo "Ver logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "Detener:"
    echo "  docker-compose down"
else
    echo "🚀 Iniciando en foreground (Ctrl+C para detener)..."
    docker-compose up --build
fi
