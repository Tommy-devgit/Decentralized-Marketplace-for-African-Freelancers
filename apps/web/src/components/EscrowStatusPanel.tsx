"use client";

import { useState } from "react";
import { getMarketplaceContract, MARKETPLACE_ADDRESS } from "@/lib/marketplace";

const STATUS_LABELS = [
  "Created",
  "Funded",
  "Completed",
  "Refunded",
  "Disputed",
];

export default function EscrowStatusPanel() {
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [details, setDetails] = useState<{
    escrow: string;
    token: string;
    amount: string;
    client: string;
    freelancer: string;
    state: number;
  } | null>(null);

  const fetchStatus = async () => {
    if (!jobId) {
      setStatus("Enter a Job ID.");
      return;
    }

    try {
      setStatus("Fetching status...");
      const contract = await getMarketplaceContract();
      const job = await contract.jobs(jobId);
      setDetails({
        escrow: job.escrow,
        token: job.token,
        amount: job.amount.toString(),
        client: job.client,
        freelancer: job.freelancer,
        state: job.status,
      });
      setStatus("Updated.");
    } catch (error: any) {
      setStatus(error?.message ?? "Unable to fetch job status.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        Escrow Status
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">Track on-chain state</h3>
      <p className="mt-2 text-sm text-white/60">
        Marketplace: {MARKETPLACE_ADDRESS || "Set NEXT_PUBLIC_MARKETPLACE_ADDRESS"}
      </p>

      <div className="mt-5 grid gap-3">
        <input
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          placeholder="Job ID"
          value={jobId}
          onChange={(event) => setJobId(event.target.value)}
        />
        <button
          onClick={fetchStatus}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
        >
          Fetch Status
        </button>
      </div>

      {details && (
        <div className="mt-5 grid gap-2 text-sm text-white/70">
          <p>Escrow: {details.escrow}</p>
          <p>Token: {details.token}</p>
          <p>Amount: {details.amount}</p>
          <p>Client: {details.client}</p>
          <p>Freelancer: {details.freelancer}</p>
          <p>State: {STATUS_LABELS[details.state] ?? "Unknown"}</p>
        </div>
      )}
      <p className="mt-3 text-xs text-white/60">{status}</p>
    </div>
  );
}