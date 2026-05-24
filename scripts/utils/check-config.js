const path = require("path");
const hre = require("hardhat");

async function main() {
  // Читаем конфиг напрямую из корня проекта
  const configPath = path.join(__dirname, "../../hardhat.config.js");
  const config = require(configPath);
  const accounts = config.networks.sepolia.accounts;
  
  console.log("Raw accounts array from config:");
  console.log("  Length:", accounts.length);
  
  accounts.forEach((acc, i) => {
    if (acc && acc !== "") {
      console.log(`  Account ${i}: ${acc.substring(0, 10)}... (${acc.length} chars)`);
    } else {
      console.log(`  Account ${i}: EMPTY or UNDEFINED`);
    }
  });
  
  // Проверяем через getSigners
  const signers = await hre.ethers.getSigners();
  console.log("\nSigners from getSigners():", signers.length);
  signers.forEach((s, i) => {
    console.log(`  Signer ${i}: ${s.address}`);
  });
}

main().catch(console.error);