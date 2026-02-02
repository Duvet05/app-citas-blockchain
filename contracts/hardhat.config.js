require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    syscoinTestnet: {
      url: process.env.SYSCOIN_TESTNET_RPC || "https://rpc.tanenbaum.io",
      chainId: 5700,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    syscoinMainnet: {
      url: process.env.SYSCOIN_MAINNET_RPC || "https://rpc.syscoin.org",
      chainId: 57,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Rollux (Layer 2) - alternativa si Syscoin NEVM tiene problemas
    rolluxTestnet: {
      url: process.env.ROLLUX_TESTNET_RPC || "https://rollux.rpc.tanenbaum.io",
      chainId: 57000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    rolluxMainnet: {
      url: process.env.ROLLUX_MAINNET_RPC || "https://rpc.rollux.com",
      chainId: 570,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
