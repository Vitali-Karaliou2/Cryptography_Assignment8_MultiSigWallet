const hre = require("hardhat");

async function main() {
  const multisigAddress = "0x6Ed8deb0538c15e0567e564Bf9ab8478A8edF494";
  const [sender] = await hre.ethers.getSigners();
  
  console.log("Sending 0.01 ETH to multisig...");
  console.log("From:", sender.address);
  console.log("To:", multisigAddress);
  
  const tx = await sender.sendTransaction({
    to: multisigAddress,
    value: hre.ethers.parseEther("0.01"),
    gasLimit: 21000
  });
  
  await tx.wait();
  console.log("\n✅ ETH sent!");
  console.log("Tx hash:", tx.hash);
  
  // Проверяем баланс мультисига
  const balance = await hre.ethers.provider.getBalance(multisigAddress);
  console.log("Multisig balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch(console.error);