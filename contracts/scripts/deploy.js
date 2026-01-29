const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "SYS\n");

  // Deploy ProfileNFT
  console.log("📋 Deploying ProfileNFT...");
  const ProfileNFT = await hre.ethers.getContractFactory("ProfileNFT");
  const profileNFT = await ProfileNFT.deploy();
  await profileNFT.waitForDeployment();
  const profileNFTAddress = await profileNFT.getAddress();
  console.log("✅ ProfileNFT deployed to:", profileNFTAddress);

  // Deploy MatchSystem
  console.log("\n🔗 Deploying MatchSystem...");
  const MatchSystem = await hre.ethers.getContractFactory("MatchSystem");
  const matchSystem = await MatchSystem.deploy(profileNFTAddress);
  await matchSystem.waitForDeployment();
  const matchSystemAddress = await matchSystem.getAddress();
  console.log("✅ MatchSystem deployed to:", matchSystemAddress);

  // Deploy VerificationSystem
  console.log("\n🔐 Deploying VerificationSystem...");
  const VerificationSystem = await hre.ethers.getContractFactory("VerificationSystem");
  const verificationSystem = await VerificationSystem.deploy(profileNFTAddress);
  await verificationSystem.waitForDeployment();
  const verificationSystemAddress = await verificationSystem.getAddress();
  console.log("✅ VerificationSystem deployed to:", verificationSystemAddress);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("\n📝 Contract Addresses:");
  console.log("ProfileNFT:         ", profileNFTAddress);
  console.log("MatchSystem:        ", matchSystemAddress);
  console.log("VerificationSystem: ", verificationSystemAddress);
  console.log("=".repeat(60));

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    contracts: {
      ProfileNFT: profileNFTAddress,
      MatchSystem: matchSystemAddress,
      VerificationSystem: verificationSystemAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const outputPath = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${outputPath}`);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 To verify contracts on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${profileNFTAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${matchSystemAddress} ${profileNFTAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${verificationSystemAddress} ${profileNFTAddress}`);
  }

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
