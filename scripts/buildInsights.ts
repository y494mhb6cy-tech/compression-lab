import { promises as fs } from 'fs';
import path from 'path';
import { analyze } from './analyzers/mockAnalyzer.js';

interface WeeklyMetric {
  week: string;
  varianceIndex: number | null;
  avgAbsCorrelation: number | null;
  correlationVelocity: number | null;
  clusterStability: number | null;
  syncEvent: boolean;
}

interface MetricsPayload {
  generatedAt: string;
  byCategory: Array<{
    category: string;
    weekly: WeeklyMetric[];
  }>;
}

const outputDir = path.join(process.cwd(), 'public', 'data');

const buildInsights = async () => {
  const raw = await fs.readFile(path.join(outputDir, 'metrics.json'), 'utf8');
  const metrics: MetricsPayload = JSON.parse(raw);

  const byCategory = metrics.byCategory.map((categoryEntry) => {
    const insights = categoryEntry.weekly.map((current, index) => {
      const previous = index > 0 ? categoryEntry.weekly[index - 1] : undefined;
      const analysis = analyze({ category: categoryEntry.category, current, previous });
      return {
        week: current.week,
        ...analysis
      };
    });
    return {
      category: categoryEntry.category,
      insights
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    byCategory
  };

  await fs.writeFile(path.join(outputDir, 'insights.json'), JSON.stringify(payload, null, 2));
};

buildInsights().catch((error) => {
  console.error(error);
  process.exit(1);
});
