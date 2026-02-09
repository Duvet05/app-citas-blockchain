const hre = require("hardhat");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYING CupidoBank + PaidMatchSystem");
  console.log("=".repeat(60) + "\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "SYS\n");

  // Existing ProfileNFT (already deployed on Syscoin NEVM Testnet)
  const PROFILE_NFT_ADDRESS = "0x8E9EB3AB9D05aF16ccECE8EbB147a5A7B0392C84";

  // 1. Deploy CupidoBank
  console.log("1. Deploying CupidoBank...");
  const CupidoBank = await hre.ethers.getContractFactory("CupidoBank");
  const bank = await CupidoBank.deploy(PROFILE_NFT_ADDRESS);
  await bank.waitForDeployment();
  const bankAddress = await bank.getAddress();
  console.log("   CupidoBank:", bankAddress);

  // 2. Deploy PaidMatchSystem
  console.log("\n2. Deploying PaidMatchSystem...");
  const PaidMatchSystem = await hre.ethers.getContractFactory("PaidMatchSystem");
  const paidMatch = await PaidMatchSystem.deploy(PROFILE_NFT_ADDRESS, bankAddress);
  await paidMatch.waitForDeployment();
  const paidMatchAddress = await paidMatch.getAddress();
  console.log("   PaidMatchSystem:", paidMatchAddress);

  // 3. Authorize PaidMatchSystem in CupidoBank
  console.log("\n3. Authorizing PaidMatchSystem...");
  const authTx = await bank.authorizeContract(paidMatchAddress);
  await authTx.wait();
  console.log("   Authorized");

  // 4. Fund treasury with 5 tSYS
  const TREASURY_AMOUNT = hre.ethers.parseEther("5");
  console.log("\n4. Funding treasury with 5 tSYS...");
  const depositTx = await bank.deposit({ value: TREASURY_AMOUNT });
  await depositTx.wait();

  const treasuryBal = await bank.getTreasuryBalance();
  console.log("   Treasury balance:", hre.ethers.formatEther(treasuryBal), "tSYS");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("\nExisting:");
  console.log("  ProfileNFT:         ", PROFILE_NFT_ADDRESS);
  console.log("  MatchSystem (old):  ", "0x6425F8c436bbA6E9ceB5030Ebca5BB2742110401");
  console.log("  VerificationSystem: ", "0x99b9e3fA3067E085dC42aAb2C35a1587405f8060");
  console.log("\nNew:");
  console.log("  CupidoBank:         ", bankAddress);
  console.log("  PaidMatchSystem:    ", paidMatchAddress);
  console.log("\nTreasury:", hre.ethers.formatEther(treasuryBal), "tSYS");
  console.log("=".repeat(60) + "\n");

  // Save deployment info
  const fs = require("fs");
  const info = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    contracts: {
      ProfileNFT: PROFILE_NFT_ADDRESS,
      MatchSystem_OLD: "0x6425F8c436bbA6E9ceB5030Ebca5BB2742110401",
      VerificationSystem: "0x99b9e3fA3067E085dC42aAb2C35a1587405f8060",
      CupidoBank: bankAddress,
      PaidMatchSystem: paidMatchAddress,
    },
    treasuryFunded: hre.ethers.formatEther(TREASURY_AMOUNT),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.mkdirSync("./deployments", { recursive: true });
  const outputPath = `./deployments/${hre.network.name}-bank.json`;
  fs.writeFileSync(outputPath, JSON.stringify(info, null, 2));
  console.log("Saved to:", outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
