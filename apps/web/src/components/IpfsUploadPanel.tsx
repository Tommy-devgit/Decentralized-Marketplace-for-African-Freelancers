"use client";

import { useState } from "react";

export default function IpfsUploadPanel({
  onUploaded,
}: {
  onUploaded?: (cid: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [cid, setCid] = useState<string>("");

  const upload = async () => {
    if (!file) {
      setStatus("Select a file first.");
      return;
    }

    setStatus("Uploading to IPFS...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Upload failed");
      }

      setCid(result.cid);
      setStatus("Uploaded.");
      onUploaded?.(result.cid);
    } catch (error: any) {
      setStatus(error?.message ?? "Upload failed.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        IPFS Upload
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">Store attachments</h3>
      <p className="mt-2 text-sm text-white/60">
        Upload any file and get a CID to store in job descriptions or portfolios.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm text-white"
        />
        <button
          onClick={upload}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Upload to IPFS
        </button>
        {cid && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white/70">
            CID: {cid}
          </div>
        )}
        <p className="text-xs text-white/60">{status}</p>
      </div>
    </div>
  );
}