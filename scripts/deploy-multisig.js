const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [owner1, owner2, owner3] = await hre.ethers.getSigners();
  
  console.log("Deploying MultisigWallet...");
  console.log("Owner 1:", owner1.address);
  console.log("Owner 2:", owner2.address);
  console.log("Owner 3:", owner3.address);
  
  const owners = [owner1.address, owner2.address, owner3.address];
  const requiredConfirmations = 2;
  
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.deploy(owners, requiredConfirmations);
  await multisig.waitForDeployment();
  
  const address = await multisig.getAddress();
  console.log("\n✅ MultisigWallet deployed to:", address);
  console.log("Required confirmations:", requiredConfirmations);
  console.log("Number of owners:", owners.length);
  
  // Обновляем .env с новым адресом
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  
  if (envContent.includes("MULTISIG_ADDRESS=")) {
    envContent = envContent.replace(
      /MULTISIG_ADDRESS=.*/,
      `MULTISIG_ADDRESS=${address}`
    );
  } else {
    envContent += `\nMULTISIG_ADDRESS=${address}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env updated with new MULTISIG_ADDRESS");
}

main().catch(console.error);