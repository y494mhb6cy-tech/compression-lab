'use client';

import { memo } from 'react';

interface HeatmapProps {
  signals: string[];
  matrix: number[][] | null;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const colorForCorrelation = (value: number) => {
  const clamped = clamp(value, -1, 1);
  const alpha = 0.15 + Math.abs(clamped) * 0.6;
  if (clamped >= 0) {
    return `rgba(34, 211, 238, ${alpha.toFixed(2)})`;
  }
  return `rgba(251, 146, 60, ${alpha.toFixed(2)})`;
};

const formatSignal = (signal: string) => signal.replace(/_/g, ' ');

const Heatmap = memo(function Heatmap({ signals, matrix }: HeatmapProps) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Not enough data to compute the latest correlations.
      </div>
    );
  }

  const size = signals.length;
  const columns = `120px repeat(${size}, minmax(48px, 1fr))`;

  return (
    <div className="h-full overflow-auto">
      <div className="grid gap-2" style={{ gridTemplateColumns: columns }}>
        <div />
        {signals.map((signal) => (
          <div key={signal} className="text-xs uppercase tracking-[0.2em] text-muted">
            {formatSignal(signal)}
          </div>
        ))}
        {signals.map((rowSignal, rowIndex) => (
          <div key={rowSignal} className="contents">
            <div className="text-xs font-semibold text-slate-100">{formatSignal(rowSignal)}</div>
            {signals.map((columnSignal, columnIndex) => {
              const value = matrix[rowIndex]?.[columnIndex] ?? 0;
              return (
                <div
                  key={`${rowSignal}-${columnSignal}`}
                  className="flex h-9 items-center justify-center rounded-lg border border-line/60 text-xs text-slate-100"
                  style={{ backgroundColor: colorForCorrelation(value) }}
                  title={`${formatSignal(rowSignal)} x ${formatSignal(columnSignal)}: ${value.toFixed(2)}`}
                >
                  {value.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Heatmap;
