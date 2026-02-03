import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Syscoin NEVM Testnet (Tanenbaum) - Red principal
export const syscoinTestnet = defineChain({
  id: 5700,
  name: 'Syscoin NEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Syscoin',
    symbol: 'tSYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tanenbaum.io'],
    },
    public: {
      http: ['https://rpc.tanenbaum.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tanenbaum Explorer',
      url: 'https://explorer.tanenbaum.io',
    },
  },
  testnet: true,
});

// Hardhat Local (para desarrollo/demo local)
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Cupido PoDA - Sistema de Karma Social',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [syscoinTestnet, hardhatLocal],
  ssr: true,
});
