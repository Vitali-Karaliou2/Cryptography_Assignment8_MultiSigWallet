const hre = require("hardhat");

async function main() {
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  if (!multisigAddress) throw new Error("MULTISIG_ADDRESS not set in .env");
  
  // Баланс мультисига
  const balance = await hre.ethers.provider.getBalance(multisigAddress);
  console.log("📊 Multisig Wallet Balance");
  console.log("=========================");
  console.log("Address:", multisigAddress);
  console.log("ETH Balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Балансы владельцев (опционально)
  console.log("\n👥 Owners Balances:");
  const owners = [
    "0xc031b182D6B80e857cd8D5db35eA5a3a19fBB363",
    "0x333a8d4E7a4796c87f88faff4F01742165b56131",
    "0xF9884f13CB4AE97E4236290FB5DE8D87C2C56754"
  ];
  
  for (let i = 0; i < owners.length; i++) {
    const ownerBalance = await hre.ethers.provider.getBalance(owners[i]);
    console.log(`  Owner ${i + 1}: ${hre.ethers.formatEther(ownerBalance)} ETH`);
  }
}

main().catch(console.error);