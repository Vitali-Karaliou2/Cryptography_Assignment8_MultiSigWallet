const hre = require("hardhat");

async function main() {
  const multisigAddress = "0x6Ed8deb0538c15e0567e564Bf9ab8478A8edF494";
  
  const MultisigWallet = await hre.ethers.getContractFactory("MultisigWallet");
  const multisig = await MultisigWallet.attach(multisigAddress);
  
  const txId = 0;
  
  console.log("Executing transaction...");
  console.log("Transaction ID:", txId);
  
  const tx = await multisig.executeTransaction(txId);
  await tx.wait();
  
  console.log("\nTransaction executed!");
  console.log("Tx hash:", tx.hash);
  
  // Показываем статус
  const executed = await multisig.getTransaction(txId);
  console.log("Executed:", executed.executed);
}

main().catch(console.error);