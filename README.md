# Multi-Signature Wallet (Assignment 8)

A secure multi-signature smart contract deployed on the **Sepolia testnet** that requires multiple owner approvals before executing transactions. This implementation features **auto-execution** when the confirmation threshold is reached.

## Key Features

- 3 owners with a 2-of-3 confirmation threshold
- Auto-execution – transaction executes automatically when enough confirmations are received
- Secure ETH transfers using checks-effects-interactions pattern
- Event logging for all key actions (submission, confirmation, execution)
- Full test coverage with Hardhat

## Project Structure

The project is organized as follows to clearly separate smart contracts, deployment scripts, utilities, and tests.

MultisigWallet/
hardhat.config.js             # Hardhat network configuration (Sepolia)
package.json                  # NPM dependencies and scripts
.env                          # Environment variables - DO NOT COMMIT
README.md                     # This file
contracts/MultisigWallet.sol  # Main Multi-Signature Wallet contract
scripts/deploy-multisig.js    # Deploys the MultisigWallet contract to Sepolia
scripts/fund-multisig.cjs     # Sends 0.01 ETH from Account 1 to the multisig
scripts/submit.js             # Creates a new transaction proposal
scripts/confirm.js            # Confirms (and auto-executes) a transaction
scripts/status.js             # Displays full multisig state
scripts/balance.js            # Shows ETH balance of the multisig wallet
scripts/utils/check-config.js # Diagnostic: verifies accounts load from .env
scripts/archive/transfer.js   # Deprecated - replaced by fund-multisig.cjs
scripts/archive/execute.js    # Deprecated - not needed (auto-execution built into confirm.js)

test/MultisigWallet.js    # Unit tests (Mocha/Chai)

## Getting Started (Setup & Execution Guide)

Follow these steps in order to clone, configure, and run the Multi-Signature Wallet on the Sepolia testnet.

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- Metamask with at least 3 accounts funded with Sepolia ETH
- Sepolia ETH faucet – get test funds from sepoliafaucet.com

### 1. Clone the Repository

Open your terminal and run:

*git clone your-github-repo-url*


*cd your-project-folder*

### 2. Install Dependencies

Install all required Node.js packages (hardhat, ethers, dotenv, etc.):

*npm install*

This installs hardhat, ethers, dotenv, @nomicfoundation/hardhat-toolbox, and other required packages.

### 3. Configure Environment Variables

Create a .env file in the project root and add the following content:

SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
SEPOLIA_PRIVATE_KEY_1=0x1111111111111111111111111111111111111111111111111111111111111111
SEPOLIA_PRIVATE_KEY_2=0x2222222222222222222222222222222222222222222222222222222222222222
SEPOLIA_PRIVATE_KEY_3=0x3333333333333333333333333333333333333333333333333333333333333333
MULTISIG_ADDRESS=

CRITICAL SECURITY NOTES:
- NEVER commit the .env file. Verify it's in your .gitignore.
- Replace the placeholder private keys with your actual Metamask private keys
- To get private keys from Metamask: Account Details > Export Private Key
- The MULTISIG_ADDRESS will be filled automatically after first deployment
- Keep these keys secure – they control real assets on testnet/mainnet

### 4. Compile the Smart Contract

*npx hardhat clean*
*npx hardhat compile*

Expected output: Compiled 1 Solidity file successfully

### 5. Deploy the Multisig Wallet

Run the deployment script. It will:
- Deploy MultisigWallet.sol with 3 owners and a requirement of 2 confirmations
- Display the deployed contract address

*npx hardhat run scripts/deploy-multisig.js --network sepolia*

Expected output:

Deploying MultisigWallet with 3 owners (2 confirmations required)...
Owners:
  - 0x1111111111111111111111111111111111111111
  - 0x2222222222222222222222222222222222222222
  - 0x3333333333333333333333333333333333333333
Multisig deployed to: 0x4444444444444444444444444444444444444444

IMPORTANT: Copy the address shown after "Multisig deployed to:" and paste it as the value for MULTISIG_ADDRESS in your .env file. Then save the .env file.

Example: MULTISIG_ADDRESS=0x4444444444444444444444444444444444444444

### 6. Fund the Multisig Wallet

Send 0.01 Sepolia ETH from Account 1 to the multisig address:

*npx hardhat run scripts/fund-multisig.cjs --network sepolia*

Expected output:

Funding multisig at 0x4444444444444444444444444444444444444444...
From: 0x1111111111111111111111111111111111111111
Amount: 0.01 ETH
Tx hash: 0x7b8c3f2e1d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c

Verify the balance:

*npx hardhat run scripts/balance.js --network sepolia*

Expected output: ETH Balance: 0.01 ETH

### 7. Execute the Complete Workflow

Now perform a full transaction cycle: Submit -> Confirm (auto-execute).

#### 7.1. Submit a Transaction (as Account 1)

Create a proposal to send 0.001 ETH from the multisig to Account 2:

*npx hardhat run scripts/submit.js --network sepolia*

Expected output:

Submitter: 0x1111111111111111111111111111111111111111
Recipient: 0x2222222222222222222222222222222222222222
Amount: 0.001 ETH

Transaction submitted! ID: 0
Tx hash: 0x3e8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9

#### 7.2. Confirm & Execute (as Account 2)

As the second owner, confirm the transaction. The contract auto-executes when the threshold (2 confirmations) is reached:

*npx hardhat run scripts/confirm.js --network sepolia*

Expected output:

Confirmer: 0x2222222222222222222222222222222222222222
Transaction ID: 0

Transaction confirmed!
Tx hash: 0xa809322d8f4c06b34a69b302cd10a82cce99dfd80cc7cdbc0cb01e7e9c70a0f4
Confirmations now: 2
Executed: true

#### 7.3. Check Final Status

View the complete state of the multisig wallet:

*npx hardhat run scripts/status.js --network sepolia*

Expected output:

Multisig Wallet Status:
=======================
Address: 0x4444444444444444444444444444444444444444
Required confirmations: 2
Owners: Result(3) [
  '0x1111111111111111111111111111111111111111',
  '0x2222222222222222222222222222222222222222',
  '0x3333333333333333333333333333333333333333'
]
Transaction count: 1

Transaction #0:
  To: 0x2222222222222222222222222222222222222222
  Value: 0.001 ETH
  Executed: true
  Confirmations: 2

## Diagnostics

If any step fails, run the diagnostic script to verify your configuration:

*npx hardhat run scripts/utils/check-config.js --network sepolia*

This script confirms:
- Correct loading of all 3 private keys from .env
- Derived wallet addresses match your Metamask accounts
- Successful connection to Sepolia RPC

## Script Reference Table

|       Action        |               Command                                           |
|---------------------|-----------------------------------------------------------------|
| Deploy contract     | npx hardhat run scripts/deploy-multisig.js --network sepolia    |
| Fund multisig       | npx hardhat run scripts/fund-multisig.cjs --network sepolia     |
| Check balance       | npx hardhat run scripts/balance.js --network sepolia            |
| Submit transaction  | npx hardhat run scripts/submit.js --network sepolia             |
| Confirm transaction | npx hardhat run scripts/confirm.js --network sepolia            |
| View full status    | npx hardhat run scripts/status.js --network sepolia             |
| Diagnose config     | npx hardhat run scripts/utils/check-config.js --network sepolia |

## Successful Deployment Links (Example)

These are placeholder links. Replace with your actual deployment links.

| Resource                 | Link                                                               |
|--------------------------|--------------------------------------------------------------------|
| Multisig Contract        | 0x4444444444444444444444444444444444444444                         |
| Confirmation Transaction | 0xa809322d8f4c06b34a69b302cd10a82cce99dfd80cc7cdbc0cb01e7e9c70a0f4 |

## Technologies Used

- Solidity ^0.8.19 – Smart contract development
- Hardhat – Development environment and testing
- Ethers.js – Ethereum interaction library
- Sepolia Testnet – Ethereum test network
- Mocha/Chai – Unit testing framework

## Notes

- The contract implements auto-execution – no separate execute.js is needed
- fund-multisig.cjs uses CommonJS (.cjs extension) to avoid ES module compatibility issues
- The archive/ folder contains deprecated scripts for reference only
- All transactions are logged with events for off-chain monitoring

## Assignment Completion Checklist

| Requirement | Status |
|-----------------------------------|-----|
| Contract deployed to Sepolia      | YES |
| 3 owners with 2-of-3 threshold    | YES |
| Submit transaction function       | YES |
| Confirm transaction function      | YES |
| Auto-execution on threshold       | YES |
| Event logging                     | YES |
| Fund multisig successfully        | YES |
| Transaction executed successfully | YES |
| Status verification works         | YES |

---

Assignment 8 - Complete