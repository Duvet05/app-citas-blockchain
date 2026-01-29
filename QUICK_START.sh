#!/bin/bash

# 🚀 Web3 Dating App - Quick Start Script
# Syscoin Hackathon 2026

set -e

echo "💖 Web3 Dating App - Quick Start"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/5: Installing dependencies..."
echo "-----------------------------------"
npm install
cd contracts && npm install && cd ..
cd frontend && npm install && cd ..
echo "✅ Dependencies installed"
echo ""

# Step 2: Check .env file
echo "🔐 Step 2/5: Checking environment variables..."
echo "-------------------------------------------"
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env and add your PRIVATE_KEY"
    echo "   (Get it from MetaMask → Account Details → Export Private Key)"
    read -p "Press enter to continue after editing .env..."
fi
echo "✅ Environment file ready"
echo ""

# Step 3: Compile contracts
echo "🔨 Step 3/5: Compiling smart contracts..."
echo "--------------------------------------"
cd contracts
npm run compile
cd ..
echo "✅ Contracts compiled"
echo ""

# Step 4: Deploy instructions
echo "🚀 Step 4/5: Ready to deploy contracts"
echo "-----------------------------------"
echo "To deploy to Syscoin Testnet, run:"
echo "  cd contracts"
echo "  npm run deploy:testnet"
echo ""
echo "Make sure you have:"
echo "  ✓ SYS testnet tokens in your wallet"
echo "  ✓ Syscoin Tanenbaum testnet configured in MetaMask"
echo "  ✓ Your PRIVATE_KEY set in .env file"
echo ""
read -p "Press enter when contracts are deployed and you have the addresses..."
echo ""

# Step 5: Configure frontend
echo "⚙️  Step 5/5: Configuring frontend..."
echo "---------------------------------"
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo "⚠️  IMPORTANT: Edit frontend/.env.local and add contract addresses"
    echo "   from the deployment output"
    read -p "Press enter after editing frontend/.env.local..."
fi
echo "✅ Frontend configured"
echo ""

# Final instructions
echo "🎉 Setup Complete!"
echo "================="
echo ""
echo "To start the development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 Next steps:"
echo "  1. Connect MetaMask to Syscoin Testnet"
echo "  2. Create your profile"
echo "  3. Start swiping!"
echo ""
echo "Need help? Check README.md or DEPLOYMENT_GUIDE.md"
echo ""
echo "Good luck with the hackathon! 💖🚀"
