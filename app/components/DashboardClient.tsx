'use client';

import { useEffect, useMemo, useState } from 'react';
import ChartCard from './ChartCard';
import Controls from './Controls';
import CorrelationChart from './CorrelationChart';
import Heatmap from './Heatmap';
import InsightCard from './InsightCard';
import VarianceChart from './VarianceChart';
import { fetchJson } from '../lib/data';
import { formatWeekLong, formatWeekShort, round } from '../lib/formatters';
import type { InsightsPayload, MetricsPayload, SeriesPayload } from '../lib/types';

interface LoadState {
  series: SeriesPayload | null;
  metrics: MetricsPayload | null;
  insights: InsightsPayload | null;
  error: string | null;
}

const initialState: LoadState = {
  series: null,
  metrics: null,
  insights: null,
  error: null
};

export default function DashboardClient() {
  const [state, setState] = useState<LoadState>(initialState);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRange, setSelectedRange] = useState(52);
  const [showEvents, setShowEvents] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [series, metrics, insights] = await Promise.all([
          fetchJson<SeriesPayload>('/data/series.json'),
          fetchJson<MetricsPayload>('/data/metrics.json'),
          fetchJson<InsightsPayload>('/data/insights.json')
        ]);
        setState({ series, metrics, insights, error: null });
        if (metrics.categories.length > 0) {
          setSelectedCategory(metrics.categories[0]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load data.';
        setState({ ...initialState, error: message });
      }
    };

    load();
  }, []);

  const categoryMetrics = useMemo(() => {
    if (!state.metrics) return null;
    return state.metrics.byCategory.find((item) => item.category === selectedCategory) ?? null;
  }, [state.metrics, selectedCategory]);

  const filteredWeekly = useMemo(() => {
    if (!categoryMetrics) return [];
    const total = categoryMetrics.weekly.length;
    const start = Math.max(0, total - selectedRange);
    return categoryMetrics.weekly.slice(start);
  }, [categoryMetrics, selectedRange]);

  const latestWeek = filteredWeekly.at(-1)?.week ?? null;
  const latestMetrics = filteredWeekly.at(-1) ?? null;

  const heatmap = useMemo(() => {
    if (!categoryMetrics || !latestWeek) return null;
    const matrix = categoryMetrics.correlationMatrices.find((item) => item.week === latestWeek);
    return matrix ?? null;
  }, [categoryMetrics, latestWeek]);

  const insight = useMemo(() => {
    if (!state.insights || !latestWeek) return null;
    const categoryInsights = state.insights.byCategory.find((item) => item.category === selectedCategory);
    if (!categoryInsights) return null;
    const match = [...categoryInsights.insights].reverse().find((item) => item.week <= latestWeek);
    return match ?? categoryInsights.insights.at(-1) ?? null;
  }, [state.insights, selectedCategory, latestWeek]);

  if (state.error) {
    return (
      <section className="glass-card rounded-2xl p-6 text-sm text-rose-200">
        {state.error} Try running `npm run generate:data`.
      </section>
    );
  }

  if (!state.metrics || !state.series || !state.insights) {
    return (
      <section className="glass-card rounded-2xl p-6 text-sm text-muted">
        Loading signals...
      </section>
    );
  }

  const categories = state.metrics.categories;

  return (
    <section className="flex flex-col gap-6">
      <Controls
        categories={categories}
        selectedCategory={selectedCategory}
        selectedRange={selectedRange}
        showEvents={showEvents}
        onCategoryChange={setSelectedCategory}
        onRangeChange={setSelectedRange}
        onToggleEvents={setShowEvents}
      />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="glass-card flex flex-col gap-2 rounded-2xl p-4 md:p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Variance Index</p>
          <p className="text-2xl font-display font-semibold text-white">
            {round(latestMetrics?.varianceIndex, 2)}
          </p>
          <p className="text-xs leading-relaxed text-muted">Compression if trending downward.</p>
        </div>
        <div className="glass-card flex flex-col gap-2 rounded-2xl p-4 md:p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Avg Abs Corr</p>
          <p className="text-2xl font-display font-semibold text-white">
            {round(latestMetrics?.avgAbsCorrelation, 2)}
          </p>
          <p className="text-xs leading-relaxed text-muted">Higher means signals move together.</p>
        </div>
        <div className="glass-card flex flex-col gap-2 rounded-2xl p-4 md:p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Correlation Velocity</p>
          <p className="text-2xl font-display font-semibold text-white">
            {round(latestMetrics?.correlationVelocity, 2)}
          </p>
          <p className="text-xs leading-relaxed text-muted">Positive = strengthening alignment.</p>
        </div>
        <div className="glass-card flex flex-col gap-2 rounded-2xl p-4 md:p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Cluster Stability</p>
          <p className="text-2xl font-display font-semibold text-white">
            {round(latestMetrics?.clusterStability, 2)}
          </p>
          <p className="text-xs leading-relaxed text-muted">Share of signals staying in clusters.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Variance Index" subtitle="Lower variance across signals implies compression.">
          <VarianceChart data={filteredWeekly} showEvents={showEvents} formatWeek={formatWeekShort} />
        </ChartCard>
        <ChartCard
          title="Correlation Alignment"
          subtitle="Avg absolute correlation plus week-to-week velocity."
        >
          <CorrelationChart data={filteredWeekly} formatWeek={formatWeekShort} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard title="Latest Correlation Matrix" subtitle="Rolling 6-week correlations by signal.">
          <Heatmap signals={heatmap?.signals ?? []} matrix={heatmap?.matrix ?? null} />
        </ChartCard>
        {insight && latestWeek ? (
          <InsightCard
            title={insight.title}
            body={insight.body}
            bullets={insight.bullets}
            weekLabel={formatWeekLong(latestWeek)}
          />
        ) : (
          <InsightCard
            title="Awaiting data"
            body="Run the generator to populate insights."
            bullets={[]}
            weekLabel="n/a"
          />
        )}
      </div>
    </section>
  );
}
