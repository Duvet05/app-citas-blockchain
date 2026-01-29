import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

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
  appName: 'Web3 Dating App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [rolluxTestnet, rolluxMainnet],
  ssr: true,
});
