"use client";

import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { shortAddress } from "@/lib/format";

export default function WalletPanel() {
  const [address, setAddress] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!window.ethereum) return;

    const provider = new BrowserProvider(window.ethereum);
    provider.getNetwork().then((network) => {
      setChainId(network.chainId.toString());
    });

    window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
      setAddress(accounts?.[0] ?? "");
    });
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected.");
        return;
      }
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(accounts?.[0] ?? "");
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      setStatus("Wallet connected.");
    } catch (error) {
      setStatus("Connection rejected.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Wallet
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {address ? shortAddress(address) : "Not connected"}
          </h3>
        </div>
        <button
          onClick={connect}
          className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-105"
        >
          {address ? "Connected" : "Connect"}
        </button>
      </div>
      <div className="mt-4 text-sm text-white/60">
        <p>Network: {chainId ? `Chain ${chainId}` : "Unknown"}</p>
        <p className="mt-2">{status}</p>
      </div>
    </div>
  );
}