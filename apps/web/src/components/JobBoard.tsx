"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Job } from "@/types/models";
import { shortAddress } from "@/lib/format";

const STATUS_STYLES: Record<Job["status"], string> = {
  open: "bg-white/10 text-white",
  accepted: "bg-blue-400/20 text-blue-100",
  funded: "bg-amber-300/20 text-amber-100",
  completed: "bg-emerald-300/20 text-emerald-100",
  cancelled: "bg-slate-400/20 text-slate-100",
  disputed: "bg-rose-400/20 text-rose-100",
};

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadJobs = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      setError(error.message);
    } else {
      setJobs((data as Job[]) ?? []);
      setError("");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    const handler = () => loadJobs();
    window.addEventListener("jobs:updated", handler);
    return () => window.removeEventListener("jobs:updated", handler);
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Live Jobs
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Explore the latest gigs
          </h3>
        </div>
        <button
          onClick={loadJobs}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          disabled={!supabase}
        >
          Refresh
        </button>
      </div>

      <p className="mt-3 text-xs text-white/40">
        Supabase configured: {isSupabaseConfigured ? "yes" : "no"}
      </p>

      {!isSupabaseConfigured && (
        <p className="mt-4 text-sm text-amber-200">
          Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` to enable the job board.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loading && <p className="text-sm text-white/60">Loading jobs...</p>}
        {error && <p className="text-sm text-rose-200">{error}</p>}
        {!loading && !error && jobs.length === 0 && supabase && (
          <p className="text-sm text-white/60">No jobs yet. Create the first one.</p>
        )}

        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                <p className="mt-2 text-sm text-white/60">
                  Client: {shortAddress(job.client_wallet)}
                </p>
                {job.freelancer_wallet && (
                  <p className="text-sm text-white/60">
                    Freelancer: {shortAddress(job.freelancer_wallet)}
                  </p>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLES[job.status]
                }`}
              >
                {job.status}
              </span>
            </div>
            <div className="mt-4 text-sm text-white/70">
              <p>Budget: {job.budget}</p>
              <p>Token: {shortAddress(job.token)}</p>
              <p>On-chain Job ID: {job.job_id}</p>
            </div>
            {job.escrow_address && (
              <p className="mt-3 text-xs text-white/50">
                Escrow: {shortAddress(job.escrow_address)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}