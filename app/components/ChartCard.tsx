import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="glass-card animate-fade-up flex flex-col gap-4 rounded-2xl p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-display font-semibold text-white">{title}</h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
      <div className="h-64 w-full md:h-72">{children}</div>
    </section>
  );
}
