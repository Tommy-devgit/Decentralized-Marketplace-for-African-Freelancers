import { BrowserProvider, Contract } from "ethers";

export const MARKETPLACE_ADDRESS =
  process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ?? "";

export const REQUIRED_CHAIN_ID = 31337n;

export const MARKETPLACE_ABI = [
  "event JobCreated(uint256 indexed jobId,address indexed client,address token,uint256 amount)",
  "function nextJobId() view returns (uint256)",
  "function createJob(string title,string descriptionCid,address token,uint256 amount) returns (uint256)",
  "function acceptJob(uint256 jobId)",
  "function fundJob(uint256 jobId) payable",
  "function approveCompletion(uint256 jobId)",
  "function requestRefund(uint256 jobId)",
  "function raiseDispute(uint256 jobId)",
  "function resolveDispute(uint256 jobId,bool releaseToFreelancer)",
  "function jobs(uint256 jobId) view returns (uint256 id,address client,address freelancer,address token,uint256 amount,string title,string descriptionCid,uint8 status,address escrow)"
];

export async function getProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected. Please install MetaMask.");
  }
  return new BrowserProvider(window.ethereum);
}

export async function ensureCorrectNetwork() {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  if (network.chainId !== REQUIRED_CHAIN_ID) {
    throw new Error(
      `Wrong network. Switch MetaMask to Localhost (chain ${REQUIRED_CHAIN_ID.toString()}).`
    );
  }
}

export async function getSigner() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  await ensureCorrectNetwork();
  return provider.getSigner();
}

export async function getMarketplaceContract() {
  if (!MARKETPLACE_ADDRESS) {
    throw new Error("Missing NEXT_PUBLIC_MARKETPLACE_ADDRESS in env.");
  }
  const signer = await getSigner();
  return new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
}