const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env' });

async function main() {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log('❌ No se encontró PRIVATE_KEY en .env');
    return;
  }

  // Crear wallet desde private key
  const wallet = new ethers.Wallet(privateKey);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔑 VERIFICACIÓN DE WALLET`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Address derivado de private key: ${wallet.address}`);
  console.log(`Address esperado (Syscoin NEVM):  0x2Ea9df907467D5F5a988f5401112f04E9242110B`);

  if (wallet.address.toLowerCase() === '0x2Ea9df907467D5F5a988f5401112f04E9242110B'.toLowerCase()) {
    console.log(`✅ ¡Private key correcta! Las addresses coinciden.`);
  } else {
    console.log(`❌ Las addresses NO coinciden. Verifica tu private key.`);
  }
  console.log(`${'='.repeat(70)}\n`);

  // Verificar balance
  const provider = new ethers.JsonRpcProvider('https://rpc.tanenbaum.io');
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balance);

  console.log(`💰 Balance actual: ${balanceEth} tSYS\n`);

  if (parseFloat(balanceEth) >= 0.5) {
    console.log(`✅ ¡Tienes suficientes fondos para el deployment!\n`);
    console.log(`🚀 Para desplegar los contratos, ejecuta:`);
    console.log(`   cd /home/duvet05/app-citas-blockchain/contracts`);
    console.log(`   npm run deploy:syscoin\n`);
  } else if (parseFloat(balanceEth) > 0) {
    console.log(`⚠️  Tienes ${balanceEth} tSYS. Puede que necesites más.`);
    console.log(`   El deployment completo necesita ~0.5-1 tSYS\n`);
  } else {
    console.log(`❌ Balance es 0. Necesitas conseguir tSYS del faucet.`);
    console.log(`   Usa el faucet web y espera a recibir los fondos.\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
