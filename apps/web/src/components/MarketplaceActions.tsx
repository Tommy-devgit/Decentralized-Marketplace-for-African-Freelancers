"use client";

import { useState } from "react";
import { parseEther } from "ethers";
import { getMarketplaceContract, MARKETPLACE_ADDRESS } from "@/lib/marketplace";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { shortAddress } from "@/lib/format";

export default function MarketplaceActions() {
  const [status, setStatus] = useState<string>("");
  const [jobId, setJobId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [cid, setCid] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [token, setToken] = useState<string>("0x0000000000000000000000000000000000000000");
  const [fundValue, setFundValue] = useState<string>("");
  const [releaseToFreelancer, setReleaseToFreelancer] = useState(true);

  const runTx = async (label: string, callback: () => Promise<unknown>) => {
    try {
      setStatus(`${label}...`);
      await callback();
      setStatus(`${label} complete.`);
    } catch (error: any) {
      setStatus(error?.message ?? "Transaction failed.");
    }
  };

  const createJob = async () => {
    await runTx("Creating job", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.createJob(title, cid, token, parseEther(amount || "0"));
      const receipt = await tx.wait();

      let createdJobId: string | null = null;
      if (receipt?.logs?.length) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed?.name === "JobCreated") {
              createdJobId = parsed.args.jobId.toString();
              break;
            }
          } catch {
            // skip non-matching logs
          }
        }
      }

      const signer = await contract.runner?.getSigner?.();
      const address = await signer?.getAddress?.();

      if (address && supabase && createdJobId) {
        await supabase.from("jobs").insert({
          job_id: createdJobId,
          title,
          description_cid: cid || null,
          budget: amount,
          token,
          client_wallet: address,
          status: "open",
        });
      }

      if (createdJobId) {
        setJobId(createdJobId);
      } else {
        setStatus("Job created, but Job ID not detected. Check console.");
      }
    });
  };

  const acceptJob = async () => {
    await runTx("Accepting job", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.acceptJob(jobId);
      await tx.wait();

      const job = await contract.jobs(jobId);
      const signer = await contract.runner?.getSigner?.();
      const address = await signer?.getAddress?.();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({
            freelancer_wallet: address ?? null,
            status: "accepted",
            escrow_address: job.escrow,
          })
          .eq("job_id", jobId);
      }
    });
  };

  const fundJob = async () => {
    await runTx("Funding job", async () => {
      const contract = await getMarketplaceContract();
      const value = fundValue ? parseEther(fundValue) : 0n;
      const tx = await contract.fundJob(jobId, { value });
      await tx.wait();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({ status: "funded" })
          .eq("job_id", jobId);
      }
    });
  };

  const approveCompletion = async () => {
    await runTx("Releasing payment", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.approveCompletion(jobId);
      await tx.wait();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({ status: "completed" })
          .eq("job_id", jobId);
      }
    });
  };

  const requestRefund = async () => {
    await runTx("Requesting refund", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.requestRefund(jobId);
      await tx.wait();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({ status: "cancelled" })
          .eq("job_id", jobId);
      }
    });
  };

  const raiseDispute = async () => {
    await runTx("Raising dispute", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.raiseDispute(jobId);
      await tx.wait();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({ status: "disputed" })
          .eq("job_id", jobId);
      }
    });
  };

  const resolveDispute = async () => {
    await runTx("Resolving dispute", async () => {
      const contract = await getMarketplaceContract();
      const tx = await contract.resolveDispute(jobId, releaseToFreelancer);
      await tx.wait();

      if (supabase) {
        await supabase
          .from("jobs")
          .update({ status: releaseToFreelancer ? "completed" : "cancelled" })
          .eq("job_id", jobId);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <h3 className="text-xl font-semibold text-white">Create Job</h3>
        <p className="mt-2 text-sm text-white/60">
          Marketplace: {MARKETPLACE_ADDRESS || "Set NEXT_PUBLIC_MARKETPLACE_ADDRESS"}
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-2 text-xs text-amber-200">
            Supabase not configured. Job board updates will be skipped.
          </p>
        )}
        <div className="mt-6 grid gap-4">
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="Job title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="IPFS CID (description)"
            value={cid}
            onChange={(event) => setCid(event.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="Amount (ETH or token units)"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="Token address (0x0 for native ETH)"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <button
            onClick={createJob}
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Create Job
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">Escrow Actions</h3>
        <p className="mt-2 text-sm text-white/60">
          Use the same Job ID across actions. For ERC20, approve the escrow
          address with your token contract before funding.
        </p>
        <div className="mt-6 grid gap-4">
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="Job ID"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          />
          <button
            onClick={acceptJob}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Accept Job
          </button>
          <input
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            placeholder="Fund value (ETH only)"
            value={fundValue}
            onChange={(event) => setFundValue(event.target.value)}
          />
          <button
            onClick={fundJob}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Fund Job
          </button>
          <button
            onClick={approveCompletion}
            className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Release Payment
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={requestRefund}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
            >
              Refund
            </button>
            <button
              onClick={raiseDispute}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
            >
              Dispute
            </button>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <span>Resolve to freelancer</span>
            <button
              onClick={() => setReleaseToFreelancer((value) => !value)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs"
            >
              {releaseToFreelancer ? "Yes" : "No"}
            </button>
          </div>
          <button
            onClick={resolveDispute}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            Resolve Dispute
          </button>
        </div>
        <p className="mt-4 text-xs text-white/60">
          Status: {status}
        </p>
        {jobId && (
          <p className="mt-2 text-xs text-white/50">
            Tracking Job {jobId} on-chain and off-chain.
          </p>
        )}
        <p className="mt-2 text-xs text-white/50">
          Token: {shortAddress(token)}
        </p>
      </div>
    </div>
  );
}