'use client';

interface InsightCardProps {
  title: string;
  body: string;
  bullets: string[];
  weekLabel: string;
}

export default function InsightCard({ title, body, bullets, weekLabel }: InsightCardProps) {
  const paragraphs = body.split('\n').filter(Boolean);

  return (
    <section className="glass-card animate-fade-up flex flex-col gap-4 rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Interpretation</p>
          <h3 className="text-xl font-display font-semibold text-white">{title}</h3>
        </div>
        <span className="rounded-full border border-line/60 px-3 py-1 text-xs text-muted">
          Week of {weekLabel}
        </span>
      </div>
      <div className="space-y-3 text-sm text-slate-200">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <ul className="space-y-2 text-sm text-slate-200">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        No prediction. Pattern-only. Correlation ≠ causation.
      </p>
    </section>
  );
}
