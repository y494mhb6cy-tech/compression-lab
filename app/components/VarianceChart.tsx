'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface VarianceChartProps {
  data: Array<{
    week: string;
    varianceIndex: number | null;
    syncEvent: boolean;
  }>;
  showEvents: boolean;
  formatWeek: (week: string) => string;
}

const renderEventDot = (props: {
  cx?: number;
  cy?: number;
  payload?: { syncEvent?: boolean };
}) => {
  if (!props.payload?.syncEvent) {
    return <circle cx={props.cx} cy={props.cy} r={0} fill="none" />;
  }
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={4}
      fill="rgba(251, 191, 36, 0.9)"
      stroke="rgba(15, 23, 42, 0.9)"
      strokeWidth={1}
    />
  );
};

export default function VarianceChart({ data, showEvents, formatWeek }: VarianceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 10, right: 24, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
        <XAxis dataKey="week" tickFormatter={formatWeek} tick={{ className: 'axis-muted' }} />
        <YAxis tick={{ className: 'axis-muted' }} />
        <Tooltip
          contentStyle={{ background: '#0b1220', border: '1px solid rgba(51, 65, 85, 0.6)' }}
          labelFormatter={(label) => `Week of ${label}`}
        />
        <Line
          type="monotone"
          dataKey="varianceIndex"
          stroke="rgba(34, 211, 238, 0.9)"
          strokeWidth={2.5}
          dot={showEvents ? renderEventDot : false}
          activeDot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
