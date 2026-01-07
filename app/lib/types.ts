export interface SeriesPoint {
  week: string;
  value: number;
  notes?: string;
}

export interface Series {
  signalKey: string;
  category: string;
  source: string;
  unit: string;
  points: SeriesPoint[];
}

export interface SignalMeta {
  key: string;
  label: string;
  unit: string;
  description: string;
}

export interface SeriesPayload {
  generatedAt: string;
  series: Series[];
  signals: SignalMeta[];
}

export interface WeeklyMetric {
  week: string;
  varianceIndex: number | null;
  avgAbsCorrelation: number | null;
  correlationVelocity: number | null;
  clusterStability: number | null;
  syncEvent: boolean;
}

export interface CorrelationMatrix {
  week: string;
  signals: string[];
  matrix: number[][];
}

export interface CategoryMetrics {
  category: string;
  thresholds: {
    varianceP25: number | null;
    velocityP75: number | null;
  };
  weekly: WeeklyMetric[];
  correlationMatrices: CorrelationMatrix[];
}

export interface MetricsPayload {
  generatedAt: string;
  windowWeeks: number;
  categories: string[];
  signalsUsed: string[];
  byCategory: CategoryMetrics[];
}

export interface Insight {
  week: string;
  title: string;
  body: string;
  bullets: string[];
}

export interface InsightsPayload {
  generatedAt: string;
  byCategory: Array<{
    category: string;
    insights: Insight[];
  }>;
}
