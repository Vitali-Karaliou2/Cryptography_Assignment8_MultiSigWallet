const hre = require("hardhat");

async function main() {
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  const [deployer] = await hre.ethers.getSigners();
  
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.attach(multisigAddress);
  
  // Кому отправляем ETH (например, владельцу 2)
  const [, receiver] = await hre.ethers.getSigners();
  const amount = hre.ethers.parseEther("0.001");
  
  console.log("Submitting transaction...");
  console.log("From (multisig):", multisigAddress);
  console.log("To:", receiver.address);
  console.log("Amount:", hre.ethers.formatEther(amount), "ETH");
  
  const tx = await multisig.submitTransaction(receiver.address, amount, "0x");
  await tx.wait();
  
  console.log("\nTransaction submitted!");
  console.log("Tx hash:", tx.hash);
  
  // Показываем статус
  const txCount = await multisig.getTransactionCount();
  const lastTxId = txCount - 1n;
  const newTx = await multisig.getTransaction(lastTxId);
  console.log("Transaction ID:", lastTxId.toString());
  console.log("Confirmations:", newTx.confirmations.toString());
}

main().catch(console.error);