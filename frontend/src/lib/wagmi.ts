import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Syscoin Tanenbaum Testnet
export const syscoinTestnet = defineChain({
  id: 5700,
  name: 'Syscoin Tanenbaum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
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
      name: 'Syscoin Testnet Explorer',
      url: 'https://tanenbaum.io',
    },
  },
  testnet: true,
});

// Define Syscoin Mainnet
export const syscoinMainnet = defineChain({
  id: 57,
  name: 'Syscoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Syscoin',
    symbol: 'SYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.syscoin.org'],
    },
    public: {
      http: ['https://rpc.syscoin.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Syscoin Explorer',
      url: 'https://explorer.syscoin.org',
    },
  },
});

export const config = getDefaultConfig({
  appName: 'Web3 Dating App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [syscoinTestnet, syscoinMainnet],
  ssr: true,
});
