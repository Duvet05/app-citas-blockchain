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
      http: [
        'https://rpc.tanenbaum.io',
        'https://syscoin-tanenbaum-evm.publicnode.com',
        'https://5700.rpc.thirdweb.com',
      ],
      ws: ['wss://rpc.tanenbaum.io/wss'],
    },
    public: {
      http: [
        'https://rpc.tanenbaum.io',
        'https://syscoin-tanenbaum-evm.publicnode.com',
        'https://5700.rpc.thirdweb.com',
      ],
      ws: ['wss://rpc.tanenbaum.io/wss'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tanenbaum Explorer',
      url: 'https://explorer.tanenbaum.io',
    },
  },
  testnet: true,
  pollingInterval: 4000, // 4s es suficiente para 60s block time, reduce polling en 4x
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
  pollingInterval: 1000, // local: blocks instant, keep polling fast
});

export const config = getDefaultConfig({
  appName: 'Cupido PoDA - Sistema de Karma Social',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [syscoinTestnet, hardhatLocal],
  ssr: true,
});
