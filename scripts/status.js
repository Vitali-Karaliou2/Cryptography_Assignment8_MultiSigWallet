const hre = require("hardhat");

async function main() {
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.attach(multisigAddress);
  
  // Получаем владельцев
  const owners = await multisig.getOwners();
  const required = await multisig.requiredConfirmations();
  const txCount = await multisig.getTransactionCount();
  
  console.log("Multisig Wallet Status:");
  console.log("=======================");
  console.log("Address:", multisigAddress);
  console.log("Required confirmations:", required.toString());
  console.log("Owners:", owners);
  console.log("Transaction count:", txCount.toString());
  
  // Показываем каждую транзакцию
  for (let i = 0; i < txCount; i++) {
    const tx = await multisig.getTransaction(i);
    console.log(`\nTransaction #${i}:`);
    console.log("  To:", tx.to);
    console.log("  Value:", hre.ethers.formatEther(tx.value), "ETH");
    console.log("  Executed:", tx.executed);
    console.log("  Confirmations:", tx.confirmations.toString());
  }
}

main().catch(console.error);