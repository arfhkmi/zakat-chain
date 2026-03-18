# Zakat Chain

A blockchain-based Zakat payment platform built for transparency and trust. Zakat Chain enables Muslims to calculate and pay their **Income Zakat (Zakat Pendapatan)** and **Fitrah Zakat** through a smart contract on BNB Smart Chain Testnet — every contribution is verifiable on-chain.

> Built for [Goddam Sahur 2026](https://sahur.dev/) — a Ramadan hackathon celebrating builders in the Muslim tech community.

---

## Features

| Feature | Description |
|---|---|
| **Income Zakat Calculator** | Gross (Mode 1) and Had Kifayah deduction-based (Mode 2) methods. Rates read live from contract. |
| **Fitrah Zakat Payment** | Choose rice grade and number of people. Rates read live from contract. |
| **On-chain Payments** | Zakat paid via ERC-20 (tMYRC) through a verified smart contract on BSC Testnet. |
| **AI Chatbot** | FAQ assistant for Zakat Pendapatan and Fitrah — powered by Llama 3.1 via Ollama. |
| **Admin Dashboard** | Manage zakat rates, deduction parameters, and collect distributed funds. |
| **Niyyah Step** | Guided intention recitation before payment confirmation. |

---

## Tech Stack

- **Frontend** — Vue 3 · TypeScript · Vite · TailwindCSS · Reown AppKit · ethers.js
- **Backend** — NestJS · Ollama (Llama 3.1)
- **Blockchain** — Solidity · BSC Testnet (Chain ID: 97)

---

## Quick Start (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- [Ollama](https://ollama.com/download/windows) installed natively on your machine

### 1. Start Ollama

```bash
# Pull the AI model (first time only, ~4.7 GB)
ollama pull llama3.1

# Start Ollama — must be accessible on all interfaces for Docker
OLLAMA_HOST=0.0.0.0 ollama serve
```

> **Windows:** Set `OLLAMA_HOST=0.0.0.0` as a persistent environment variable via System Properties → Environment Variables, then restart Ollama from the tray icon.
>
> **GPU:** Ollama auto-detects NVIDIA and AMD GPUs. Without a GPU, responses take 2–5 minutes (calculator and payment features are not affected).

### 2. Run the App

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000 |

### Stop

```bash
docker-compose down
```

### Start Again (no rebuild)

```bash
docker-compose up -d
```

---

## New to Web3?

1. Install [MetaMask](https://metamask.io/) and create a wallet.
2. Add BSC Testnet: https://revoke.cash/learn/wallets/add-network/bnb-chain-testnet
3. Claim free tBNB (gas fees): https://ghostchain.io/faucet/bnb-testnet/
4. Mint test tMYRC tokens at the token contract on BscScan:
   `0x6270f082dEa012a20A101bEf7117F651f6B91cae` — use **18 decimals**.
5. You're ready to pay Zakat.

---

## Local Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on **http://localhost:3000**.

### Frontend

```bash
cd frontend
npm install
```

Copy the env file:

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Fill in `.env` with this:

```env
VITE_REOWN_ID='7ce0561cf721b8dc1172899793a8d297'
VITE_ZAKAT_CONTRACT_ADDRESS='0x9891ba8A879324923751F5DF4476d69E840c0169'
VITE_BNB_RPC_NODE_1='https://bsc-testnet-rpc.publicnode.com'
VITE_BNB_RPC_NODE_2='https://bsc-testnet-dataseed.bnbchain.org'
VITE_BNB_RPC_NODE_3='https://bnb-testnet.api.onfinality.io/public'
VITE_URL_API='http://localhost:3000'
```

```bash
npm run dev
```

Runs on **http://localhost:8080**.

---

## Smart Contract

| | |
|---|---|
| **Network** | BSC Testnet (Chain ID: 97) |
| **Zakat Contract** | `0x9891ba8A879324923751F5DF4476d69E840c0169` |
| **Payment Token (tMYRC)** | `0x6270f082dEa012a20A101bEf7117F651f6B91cae` |
| **Explorer** | https://testnet.bscscan.com |

---

## Project Structure

```
zakat-chain/
├── backend/
│   └── src/
│       ├── zakat_service.ts          # Income zakat calculation
│       ├── zakatfitrah_service.ts    # Fitrah zakat calculation
│       ├── Chatbot/                  # AI FAQ chatbot (Ollama)
│       └── auth/                     # Admin authentication
├── frontend/
│   ├── src/
│   │   ├── views/                    # Page components
│   │   └── components/               # Shared UI components
│   └── utils/
│       ├── zakatInteraction.ts       # Contract interaction (ethers.js)
│       ├── api.ts                    # Backend API client
│       └── abi/                      # Contract ABIs
└── docker-compose.yml
```
