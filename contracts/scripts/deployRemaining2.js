const hre = require("hardhat");

async function main() {
  const PROFILE_NFT = "0x8E9EB3AB9D05aF16ccECE8EbB147a5A7B0392C84";
  const BANK = "0x8c4aA7669521CE807Cd0bb7590843e40a847b520";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(bal), "tSYS\n");

  // Deploy PaidMatchSystem using raw tx to avoid getTransaction bug
  console.log("Deploying PaidMatchSystem...");
  const PaidMatchSystem = await hre.ethers.getContractFactory("PaidMatchSystem");
  const deployTx = await PaidMatchSystem.getDeployTransaction(PROFILE_NFT, BANK);
  const sentTx = await deployer.sendTransaction(deployTx);
  console.log("TX:", sentTx.hash);
  console.log("Waiting for block...");
  const receipt = await sentTx.wait();
  const paidMatchAddress = receipt.contractAddress;
  console.log("PaidMatchSystem:", paidMatchAddress, "\n");

  // Authorize
  console.log("Authorizing PaidMatchSystem in CupidoBank...");
  const bankABI = [
    "function authorizeContract(address) external",
    "function deposit() external payable",
    "function getTreasuryBalance() external view returns (uint256)",
  ];
  const bank = new hre.ethers.Contract(BANK, bankABI, deployer);
  const authTx = await bank.authorizeContract(paidMatchAddress);
  console.log("Auth TX:", authTx.hash);
  await authTx.wait();
  console.log("Authorized\n");

  // Fund treasury with 5 tSYS
  console.log("Funding treasury with 5 tSYS...");
  const depositTx = await bank.deposit({ value: hre.ethers.parseEther("5") });
  console.log("Deposit TX:", depositTx.hash);
  await depositTx.wait();
  const treasuryBal = await bank.getTreasuryBalance();
  console.log("Treasury:", hre.ethers.formatEther(treasuryBal), "tSYS\n");

  // Save
  console.log("=".repeat(60));
  console.log("CupidoBank:      ", BANK);
  console.log("PaidMatchSystem: ", paidMatchAddress);
  console.log("Treasury:        ", hre.ethers.formatEther(treasuryBal), "tSYS");
  console.log("=".repeat(60));

  const fs = require("fs");
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(
    "./deployments/syscoinTestnet-bank.json",
    JSON.stringify(
      {
        network: "syscoinTestnet",
        chainId: 5700,
        contracts: {
          ProfileNFT: PROFILE_NFT,
          MatchSystem_OLD: "0x6425F8c436bbA6E9ceB5030Ebca5BB2742110401",
          VerificationSystem: "0x99b9e3fA3067E085dC42aAb2C35a1587405f8060",
          CupidoBank: BANK,
          PaidMatchSystem: paidMatchAddress,
        },
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log("\nSaved to deployments/syscoinTestnet-bank.json");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
