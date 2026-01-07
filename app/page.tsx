import DashboardClient from './components/DashboardClient';

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-line/70 bg-gradient-to-br from-white/10 via-card/80 to-transparent shadow-glow" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Reality Compression Lab</p>
              <h1 className="gradient-text text-3xl font-display font-semibold md:text-4xl">
                Labor Signals
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-base leading-relaxed text-muted md:text-lg">
            A grounded dashboard that watches for structure formation in independent labor-market signals.
            No forecasting, no politics - just careful pattern tracking.
          </p>
        </header>
        <DashboardClient />
        <footer className="border-t border-line/60 pt-8 text-[11px] uppercase tracking-[0.2em] text-muted">
          Data is synthetic. Signals are aggregated weekly. Correlation ≠ causation.
        </footer>
      </div>
    </main>
  );
}
