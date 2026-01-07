import { promises as fs } from 'fs';
import path from 'path';
import { clusterStabilityScore, kMeansClusters } from './utils/cluster.js';
import { mean, percentile, pearson, stdDev, variance } from './utils/math.js';

interface SeriesPoint {
  week: string;
  value: number;
}

interface SeriesEntry {
  signalKey: string;
  category: string;
  source: string;
  unit: string;
  points: SeriesPoint[];
}

interface SeriesPayload {
  generatedAt: string;
  series: SeriesEntry[];
}

const outputDir = path.join(process.cwd(), 'public', 'data');
const windowWeeks = 6;
const thresholdWindow = 26;
const kClusters = 3;

const buildMetrics = async () => {
  const raw = await fs.readFile(path.join(outputDir, 'series.json'), 'utf8');
  const data: SeriesPayload = JSON.parse(raw);

  const categories = Array.from(new Set(data.series.map((item) => item.category)));
  const signalsUsed = Array.from(new Set(data.series.map((item) => item.signalKey)));

  const byCategory = categories.map((category) => {
    const series = data.series.filter((item) => item.category === category);
    const weeks = series[0]?.points.map((point) => point.week) ?? [];
    const signalKeys = series.map((item) => item.signalKey);

    const valuesBySignal = new Map<string, number[]>();
    series.forEach((entry) => {
      valuesBySignal.set(
        entry.signalKey,
        entry.points.map((point) => point.value)
      );
    });

    const statsBySignal = new Map<string, { mean: number; std: number }>();
    signalKeys.forEach((signal) => {
      const values = valuesBySignal.get(signal) ?? [];
      const avg = mean(values);
      const sd = stdDev(values) || 1;
      statsBySignal.set(signal, { mean: avg, std: sd });
    });

    const varianceIndex: Array<number | null> = [];
    const avgAbsCorrelation: Array<number | null> = [];
    const correlationVelocity: Array<number | null> = [];
    const clusterStability: Array<number | null> = [];
    const correlationMatrices: Array<{ week: string; signals: string[]; matrix: number[][] }> = [];

    let prevClusters: number[] | null = null;

    weeks.forEach((week, index) => {
      const zScores = signalKeys.map((signal) => {
        const stats = statsBySignal.get(signal)!;
        const value = valuesBySignal.get(signal)![index];
        return (value - stats.mean) / stats.std;
      });
      varianceIndex[index] = variance(zScores);

      if (index < windowWeeks - 1) {
        avgAbsCorrelation[index] = null;
        correlationVelocity[index] = null;
        clusterStability[index] = null;
        return;
      }

      const windowStart = index - windowWeeks + 1;
      const windowed = signalKeys.map((signal) => {
        const values = valuesBySignal.get(signal)!;
        return values.slice(windowStart, index + 1);
      });

      const matrix: number[][] = windowed.map(() => new Array(signalKeys.length).fill(0));
      for (let i = 0; i < signalKeys.length; i += 1) {
        for (let j = i; j < signalKeys.length; j += 1) {
          const corr = i === j ? 1 : pearson(windowed[i], windowed[j]);
          matrix[i][j] = corr;
          matrix[j][i] = corr;
        }
      }

      correlationMatrices.push({ week, signals: signalKeys, matrix });

      const absValues: number[] = [];
      for (let i = 0; i < signalKeys.length; i += 1) {
        for (let j = i + 1; j < signalKeys.length; j += 1) {
          absValues.push(Math.abs(matrix[i][j]));
        }
      }
      avgAbsCorrelation[index] = absValues.length ? mean(absValues) : 0;
      const prevCorrelation = avgAbsCorrelation[index - 1];
      correlationVelocity[index] =
        prevCorrelation === null || prevCorrelation === undefined
          ? null
          : avgAbsCorrelation[index]! - prevCorrelation;

      const clusters = kMeansClusters(matrix, kClusters);
      if (prevClusters) {
        clusterStability[index] = clusterStabilityScore(prevClusters, clusters) ?? null;
      } else {
        clusterStability[index] = 1;
      }
      prevClusters = clusters;
    });

    const weekly = weeks.map((week, index) => {
      const varianceValue = varianceIndex[index];
      const velocityValue = correlationVelocity[index];
      const varianceWindow = varianceIndex
        .slice(Math.max(0, index - thresholdWindow + 1), index + 1)
        .filter((value): value is number => value !== null);
      const velocityWindow = correlationVelocity
        .slice(Math.max(0, index - thresholdWindow + 1), index + 1)
        .filter((value): value is number => value !== null);

      const varianceThreshold = percentile(varianceWindow, 0.25);
      const velocityThreshold = percentile(velocityWindow, 0.75);

      const syncEvent =
        varianceValue !== null &&
        velocityValue !== null &&
        varianceThreshold !== null &&
        velocityThreshold !== null &&
        varianceValue < varianceThreshold &&
        velocityValue > Math.max(0, velocityThreshold);

      return {
        week,
        varianceIndex: varianceValue,
        avgAbsCorrelation: avgAbsCorrelation[index],
        correlationVelocity: correlationVelocity[index],
        clusterStability: clusterStability[index],
        syncEvent
      };
    });

    const latestVarianceWindow = varianceIndex
      .slice(-thresholdWindow)
      .filter((value): value is number => value !== null);
    const latestVelocityWindow = correlationVelocity
      .slice(-thresholdWindow)
      .filter((value): value is number => value !== null);

    return {
      category,
      thresholds: {
        varianceP25: percentile(latestVarianceWindow, 0.25),
        velocityP75: percentile(latestVelocityWindow, 0.75)
      },
      weekly,
      correlationMatrices
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    windowWeeks,
    categories,
    signalsUsed,
    byCategory
  };

  await fs.writeFile(path.join(outputDir, 'metrics.json'), JSON.stringify(payload, null, 2));
};

buildMetrics().catch((error) => {
  console.error(error);
  process.exit(1);
});
