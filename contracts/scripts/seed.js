const hre = require("hardhat");

// Datos fake para perfiles de demo
const DEMO_PROFILES = [
  { name: "María García", age: 24, bio: "Amante del arte y la música. Me encanta bailar salsa 💃", interests: "música, arte, baile, viajes" },
  { name: "Camila Torres", age: 26, bio: "Desarrolladora Frontend. Coffee lover ☕", interests: "coding, café, libros, yoga" },
  { name: "Sandra López", age: 23, bio: "Estudiante de medicina. Fanática del hiking 🏔️", interests: "naturaleza, medicina, deportes" },
  { name: "Viviana Ruiz", age: 28, bio: "Chef profesional. La comida es mi pasión 🍝", interests: "cocina, gastronomía, vino" },
  { name: "Pilar Ramos", age: 25, bio: "Fotógrafa freelance. Capturando momentos 📸", interests: "fotografía, viajes, arte" },
  { name: "Lizeth Vega", age: 27, bio: "Arquitecta. Diseñando el futuro 🏗️", interests: "arquitectura, diseño, cine" },
  { name: "Ana Martínez", age: 22, bio: "Community manager y creadora de contenido", interests: "redes sociales, marketing, moda" },
  { name: "Carla Díaz", age: 29, bio: "Abogada. Justicia y derechos humanos ⚖️", interests: "derecho, lectura, política" },
  { name: "Juan Pérez", age: 26, bio: "Ingeniero de software. Blockchain enthusiast 🚀", interests: "blockchain, gaming, tech" },
  { name: "Carlos Mendoza", age: 28, bio: "Emprendedor. Siempre buscando nuevos retos 💼", interests: "startups, negocios, finanzas" },
  { name: "Diego Silva", age: 25, bio: "Músico y productor. La vida es una canción 🎵", interests: "música, producción, conciertos" },
  { name: "Luis Flores", age: 30, bio: "Profesor de matemáticas. Números y café ☕", interests: "educación, matemáticas, ajedrez" },
  { name: "Roberto Castro", age: 24, bio: "Diseñador gráfico. Creatividad sin límites 🎨", interests: "diseño, ilustración, anime" },
  { name: "Miguel Ángel", age: 27, bio: "Personal trainer. Fitness is life 💪", interests: "gym, nutrición, deportes" },
  { name: "Daniela Rojas", age: 23, bio: "Bióloga marina. Amante del océano 🌊", interests: "biología, buceo, ecología" },
  { name: "Valentina Cruz", age: 26, bio: "Psicóloga. Entendiendo la mente humana 🧠", interests: "psicología, meditación, lectura" },
  { name: "Sofía Morales", age: 24, bio: "Ingeniera industrial. Optimizando procesos 📊", interests: "ingeniería, productividad, tech" },
  { name: "Isabella Reyes", age: 25, bio: "Marketing digital. Data-driven decisions 📈", interests: "marketing, analytics, emprendimiento" },
  { name: "Gabriela Núñez", age: 28, bio: "Veterinaria. Los animales son mi vida 🐾", interests: "animales, veterinaria, naturaleza" },
  { name: "Alejandra Paz", age: 22, bio: "Estudiante de diseño UX/UI. User first! 💻", interests: "UX, diseño, tecnología" },
];

async function main() {
  console.log("🌱 Starting seed script for Cupido PoDA...\n");

  // Get deployed contract addresses
  const networkName = hre.network.name;
  console.log(`📡 Network: ${networkName}\n`);

  // Get contract addresses from deployment file
  const fs = require("fs");
  const deploymentPath = `./deployments/${networkName}.json`;

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Error: Contracts not deployed yet!");
    console.log("Run: npm run deploy:testnet first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const profileNFTAddress = deployment.contracts.ProfileNFT;

  console.log("📋 ProfileNFT Contract:", profileNFTAddress);
  console.log("\n" + "=".repeat(60));

  // Connect to contract
  const ProfileNFT = await hre.ethers.getContractFactory("ProfileNFT");
  const profileNFT = ProfileNFT.attach(profileNFTAddress);

  // Generate random wallets for demo users
  const demoWallets = [];
  for (let i = 0; i < DEMO_PROFILES.length; i++) {
    const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
    demoWallets.push(wallet);
  }

  // Get deployer (who will fund the demo wallets)
  const [deployer] = await hre.ethers.getSigners();
  console.log("💰 Funding demo wallets from:", deployer.address);

  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💵 Deployer balance:", hre.ethers.formatEther(deployerBalance), "SYS\n");

  // Amount to send to each demo wallet (enough for creating profile)
  const fundAmount = hre.ethers.parseEther("0.01"); // 0.01 SYS each

  // ── Fase 1: Fund todos los wallets (mismo sender → enviar secuencial, esperar en paralelo)
  console.log("💸 Fase 1: Enviando fondos a todos los wallets...");
  const fundTxs = [];
  for (let i = 0; i < demoWallets.length; i++) {
    const tx = await deployer.sendTransaction({
      to: demoWallets[i].address,
      value: fundAmount,
    });
    fundTxs.push(tx);
    console.log(`   [${i + 1}/${demoWallets.length}] Fund tx enviada: ${tx.hash}`);
  }
  console.log("   ⏳ Esperando confirmación de todas las fund txs...");
  await Promise.all(fundTxs.map((tx) => tx.wait()));
  console.log("   ✅ Todos los wallets fondeados.\n");

  // ── Fase 2: Crear perfiles en paralelo (senders diferentes → nonces independientes)
  console.log("📝 Fase 2: Creando perfiles en paralelo...");
  const profileResults = await Promise.allSettled(
    DEMO_PROFILES.map(async (profile, i) => {
      const wallet = demoWallets[i];
      const tx = await profileNFT.connect(wallet).createProfile(
        profile.name,
        profile.age,
        profile.bio,
        profile.interests,
        "" // tokenURI
      );
      await tx.wait();
      console.log(`   ✅ [${i + 1}] Perfil creado: ${profile.name}`);
    })
  );

  let successCount = 0;
  let failCount = 0;
  for (const result of profileResults) {
    if (result.status === "fulfilled") {
      successCount++;
    } else {
      failCount++;
      console.error(`   ❌ Failed: ${result.reason.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SEED SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successful: ${successCount}/${DEMO_PROFILES.length}`);
  console.log(`❌ Failed: ${failCount}/${DEMO_PROFILES.length}`);
  console.log(`💰 Total SYS spent: ~${hre.ethers.formatEther(fundAmount * BigInt(successCount))} SYS`);
  console.log("=".repeat(60));

  // Save demo wallet addresses for reference
  const demoWalletsData = demoWallets.map((wallet, i) => ({
    name: DEMO_PROFILES[i].name,
    address: wallet.address,
    privateKey: wallet.privateKey,
  }));

  const outputPath = `./deployments/${networkName}-demo-wallets.json`;
  fs.writeFileSync(outputPath, JSON.stringify(demoWalletsData, null, 2));
  console.log(`\n💾 Demo wallets saved to: ${outputPath}`);
  console.log("\n⚠️  WARNING: Keep this file secret! Contains private keys.\n");
  console.log("✨ Seed complete! You now have demo profiles on-chain.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
