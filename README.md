# Zakat Chain

A blockchain-based Zakat payment platform built for transparency and trust. Zakat Chain enables Muslims to calculate and pay their **Income Zakat (Zakat Pendapatan)** and **Fitrah Zakat** through a smart contract on the BNB Smart Chain testnet, ensuring every contribution is verifiable on-chain.

> Built for [Goddam Sahur 2026](https://sahur.dev/) — a Ramadan hackathon celebrating builders in the Muslim tech community.

### Features
- **Income Zakat Calculator** — Supports both gross (Mode 1) and Had Kifayah deduction-based (Mode 2) calculation methods
- **Fitrah Zakat Payment** — Select rice category (Standard / Mid-Range / Premium) and number of people
- **On-chain Payments** — Zakat is paid via ERC-20 token through a verified smart contract
- **Admin Dashboard** — Manage zakat rates, deduction parameters, and collect distributed funds
- **Niyyah Step** — Guided intention recitation before payment confirmation

### Tech Stack
- **Frontend:** Vue 3 + TypeScript + Vite + TailwindCSS
- **Backend:** NestJS (zakat calculation engine)
- **Blockchain:** Solidity smart contract on BSC Testnet, integrated via ethers.js + Reown AppKit

---

## 🚀 How to Run

### 1. Back-End Run
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the server (Development mode):
   ```bash
   npm run start:dev
   ```

### 2. Front-End Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm i

   #First-timer
   copy .env.example
   paste as .env
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Open the link displayed in your terminal (usually [http://localhost:5173](http://localhost:5173)) in your browser.