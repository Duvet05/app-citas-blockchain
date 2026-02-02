import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { localhost } from 'viem/chains';

// Define Hardhat Local (para demo)
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

// Define Rollux Tanenbaum Testnet
export const rolluxTestnet = defineChain({
  id: 57000,
  name: 'Rollux Tanenbaum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'tSYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-tanenbaum.rollux.com'],
    },
    public: {
      http: ['https://rpc-tanenbaum.rollux.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rollux Testnet Explorer',
      url: 'https://rollux.tanenbaum.io',
    },
  },
  testnet: true,
});

// Define Rollux Mainnet
export const rolluxMainnet = defineChain({
  id: 570,
  name: 'Rollux Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.rollux.com'],
    },
    public: {
      http: ['https://rpc.rollux.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Rollux Explorer',
      url: 'https://explorer.rollux.com',
    },
  },
});

export const config = getDefaultConfig({
  appName: 'Cupido PoDA - Sistema de Karma Social',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [hardhatLocal, rolluxTestnet, rolluxMainnet],
  ssr: true,
});
