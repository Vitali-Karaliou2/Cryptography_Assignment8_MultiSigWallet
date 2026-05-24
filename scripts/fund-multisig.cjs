const hre = require("hardhat");

async function main() {
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  if (!multisigAddress) throw new Error("MULTISIG_ADDRESS not set in .env");
  
  const [sender] = await hre.ethers.getSigners();
  
  console.log("Funding multisig wallet...");
  console.log("From:", sender.address);
  console.log("To:", multisigAddress);
  console.log("Amount: 0.01 ETH");
  
  const tx = await sender.sendTransaction({
    to: multisigAddress,
    value: hre.ethers.parseEther("0.01"),
    gasLimit: 50000
  });
  
  await tx.wait();
  console.log("\n✅ 0.01 ETH sent!");
  console.log("Tx hash:", tx.hash);
  
  const balance = await hre.ethers.provider.getBalance(multisigAddress);
  console.log("Multisig balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch(console.error);