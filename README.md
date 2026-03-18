# Zakat Chain

A blockchain-based Zakat payment platform built for transparency and trust. Zakat Chain enables Muslims to calculate and pay their **Income Zakat (Zakat Pendapatan)** and **Fitrah Zakat** through a smart contract on the BNB Smart Chain testnet, ensuring every contribution is verifiable on-chain.

> Built for [Goddam Sahur 2026](https://sahur.dev/) — a Ramadan hackathon celebrating builders in the Muslim tech community.

## Features

- **Income Zakat Calculator** — Supports gross (Mode 1) and Had Kifayah deduction-based (Mode 2) calculation methods. Rates are read live from the smart contract.
- **Fitrah Zakat Payment** — Select rice category (Standard / Mid-Range / Premium) and number of people. Rates are read live from the smart contract.
- **On-chain Payments** — Zakat is paid via ERC-20 token through a verified smart contract on BSC Testnet.
- **Admin Dashboard** — Manage zakat rates, deduction parameters, and collect distributed funds.
- **Niyyah Step** — Guided intention recitation before payment confirmation.

## Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite + TailwindCSS + Reown AppKit
- **Backend:** NestJS (zakat calculation engine)
- **Blockchain:** Solidity smart contract on BSC Testnet, integrated via ethers.js

---

## New to Web3? Start Here

1. Install [MetaMask](https://metamask.io/) and create your wallet.
2. Add BSC Testnet to your wallet: https://revoke.cash/learn/wallets/add-network/bnb-chain-testnet
3. Claim free tBNB for gas fees: https://ghostchain.io/faucet/bnb-testnet/
4. Mint test MYRC tokens (fake RM) to yourself at the token contract on BscScan:
   `0x6270f082dEa012a20A101bEf7117F651f6B91cae` — use **18 decimals** in the input.
5. You're ready to pay Zakat!

---

## How to Run

### 1. Backend

```bash
cd backend
npm install
npm run start:dev
```

The server runs on **http://localhost:3000**.

### 2. Frontend

```bash
cd frontend
npm install
```

**First time setup** — copy the example env file:

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Fill in your `.env` values:

```env
VITE_REOWN_ID=            # Get from https://cloud.reown.com
VITE_ZAKAT_CONTRACT_ADDRESS=   # Deployed contract address
VITE_BNB_RPC_NODE_1=      # BSC Testnet RPC (e.g. https://bsc-testnet-rpc.publicnode.com)
VITE_BNB_RPC_NODE_2=      # Fallback RPC node
VITE_BNB_RPC_NODE_3=      # Fallback RPC node
VITE_URL_API=http://localhost:3000
```

Then start the app:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Smart Contract

| Network | BSC Testnet (Chain ID: 97) |
|---------|---------------------------|
| Contract | `0x9891ba8A879324923751F5DF4476d69E840c0169` |
| Payment Token (MYRC) | `0x6270f082dEa012a20A101bEf7117F651f6B91cae` |
| Explorer | https://testnet.bscscan.com |

---

## Project Structure

```
zakat-chain/
├── backend/          # NestJS calculation engine
│   └── src/
│       ├── zakat_service.ts        # Income zakat calculation
│       ├── zakatfitrah_service.ts  # Fitrah zakat calculation
│       └── ...
├── frontend/         # Vue 3 app
│   ├── src/
│   │   ├── views/                  # Page components
│   │   └── components/             # Shared UI components
│   └── utils/
│       ├── zakatInteraction.ts     # All contract interaction (ethers.js)
│       ├── api.ts                  # Backend API client
│       └── abi/                    # Contract ABIs
└── README.md
```
