# Decentralized Marketplace for African Freelancers

A Web3 freelance marketplace where clients hire freelancers and payments are handled by on-chain escrow. The core idea is simple: **trustless payments** with transparent dispute handling, built for regions where traditional payment rails fail.

**Current build status (March 17, 2026):**
- Smart contracts for job creation + escrow are implemented.
- Next.js MVP UI and wallet connect are scaffolded.
- Tests cover ETH and ERC20 escrow flows.

## MVP Scope
- Wallet connect (MetaMask)
- Create job with fixed price
- Accept job (escrow is deployed)
- Fund escrow (ETH or ERC20)
- Release payment / refund / dispute
- Transaction history: pulled on frontend using contract reads

## Architecture

Data Type | Storage
--- | ---
Payments | Blockchain (Escrow.sol)
Contract logic | Blockchain (Marketplace.sol)
Profiles + gigs | Off-chain DB (Supabase/Firebase)
Files | IPFS

## Repository Structure
- `apps/web` Next.js app router frontend
- `contracts` Hardhat contracts + tests

## Smart Contracts
- `Marketplace.sol` deploys a new `Escrow` contract when a freelancer accepts a job.
- `Escrow.sol` holds funds and enforces release/refund/dispute logic.

## Quickstart

### 1) Install dependencies
```
npm install
npm --prefix apps/web install
npm --prefix contracts install
```

### 2) Run local chain + deploy
```
cd contracts
npx hardhat node
```
In a new terminal:
```
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### 3) Configure frontend
Create `apps/web/.env.local`:
```
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xYourDeployedAddress
```

### 4) Run frontend
```
cd apps/web
npm run dev
```

## Next Steps
- Add Supabase for profiles + jobs
- Upload job attachments to IPFS
- Add UI for job discovery and escrow state display
- Add DAO dispute voting (optional)