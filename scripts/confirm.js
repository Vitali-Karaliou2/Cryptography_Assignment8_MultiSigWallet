const hre = require("hardhat");

async function main() {
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  if (!multisigAddress) throw new Error("MULTISIG_ADDRESS not set in .env");
  
  // Второй владелец (индекс 1)
  const [, owner2] = await hre.ethers.getSigners();
  const txId = 0;
  
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.attach(multisigAddress);
  
  console.log("Confirming transaction...");
  console.log("Confirmer:", owner2.address);
  console.log("Transaction ID:", txId);
  
  // Убедимся, что транзакция ещё не выполнена
  const tx = await multisig.getTransaction(txId);
  if (tx.executed) {
    console.log("Transaction already executed!");
    return;
  }
  
  if (tx.confirmations >= 2) {
    console.log("Already has enough confirmations!");
    return;
  }
  
  const confirmTx = await multisig.connect(owner2).confirmTransaction(txId);
  await confirmTx.wait();
  
  console.log("\n✅ Transaction confirmed!");
  console.log("Tx hash:", confirmTx.hash);
  
  const updatedTx = await multisig.getTransaction(txId);
  console.log("Confirmations now:", updatedTx.confirmations.toString());
  console.log("Executed:", updatedTx.executed);
}

main().catch(console.error);