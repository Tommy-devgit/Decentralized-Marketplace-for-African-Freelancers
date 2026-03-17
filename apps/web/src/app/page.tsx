import WalletPanel from "@/components/WalletPanel";
import MarketplaceActions from "@/components/MarketplaceActions";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber-300/20 blur-[120px]" />
        <div className="pointer-events-none absolute left-0 top-32 h-72 w-72 rounded-full bg-emerald-400/10 blur-[140px]" />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-300/90" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Nia</p>
              <h1 className="text-lg font-semibold">Freelance Market</h1>
            </div>
          </div>
          <button className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
            Launch Testnet
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/40">
                Escrow-first marketplace
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                Freelance work protected by smart contracts, built for Africa.
              </h2>
              <p className="mt-6 max-w-xl text-lg text-white/60">
                Nia removes payment barriers by keeping funds in transparent escrow. Clients and
                freelancers agree on terms, lock funds, and release only when work is approved.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Crypto escrow",
                  "No platform hold",
                  "Lower fees",
                  "Global payouts"
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/50">Fees</p>
                  <p className="mt-2 text-2xl font-semibold">3%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/50">Escrow</p>
                  <p className="mt-2 text-2xl font-semibold">On-chain</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/50">Payout</p>
                  <p className="mt-2 text-2xl font-semibold">USDT / ETH</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <WalletPanel />
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">MVP Flow</h3>
                <ol className="mt-4 space-y-3 text-sm text-white/70">
                  <li>1. Client creates a job with a fixed amount.</li>
                  <li>2. Freelancer accepts and escrow is deployed.</li>
                  <li>3. Client funds escrow with ETH or token.</li>
                  <li>4. Client releases payment when work is delivered.</li>
                </ol>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-white/60">
                  Storage: profiles and gigs live off-chain. Files are pinned to IPFS. Only money
                  and escrow logic live on-chain.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h3 className="text-2xl font-semibold">Run the Escrow</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Connect your wallet, deploy the contract on a testnet, then use the controls below
              to simulate a real job flow.
            </p>
            <div className="mt-8">
              <MarketplaceActions />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}