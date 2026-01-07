'use client';

import {
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface CorrelationChartProps {
  data: Array<{
    week: string;
    avgAbsCorrelation: number | null;
    correlationVelocity: number | null;
  }>;
  formatWeek: (week: string) => string;
}

export default function CorrelationChart({ data, formatWeek }: CorrelationChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ left: 10, right: 24, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis dataKey="week" tickFormatter={formatWeek} tick={{ className: 'axis-muted' }} />
        <YAxis
          yAxisId="left"
          tick={{ className: 'axis-muted' }}
          domain={[0, 1]}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ className: 'axis-muted' }}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip
          contentStyle={{ background: '#0b1220', border: '1px solid rgba(51, 65, 85, 0.6)' }}
          labelFormatter={(label) => `Week of ${label}`}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="avgAbsCorrelation"
          stroke="rgba(94, 234, 212, 0.9)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="correlationVelocity"
          stroke="rgba(251, 146, 60, 0.9)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
