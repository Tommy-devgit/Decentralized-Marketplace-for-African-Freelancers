export type JobStatus =
  | "open"
  | "accepted"
  | "funded"
  | "completed"
  | "cancelled"
  | "disputed";

export type Job = {
  id: number;
  job_id: string;
  title: string;
  description_cid: string | null;
  budget: string;
  token: string;
  client_wallet: string;
  freelancer_wallet: string | null;
  status: JobStatus;
  escrow_address: string | null;
  created_at: string;
};