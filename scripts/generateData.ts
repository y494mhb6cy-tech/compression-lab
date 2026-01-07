import { promises as fs } from 'fs';
import path from 'path';

interface SignalConfig {
  key: string;
  label: string;
  unit: 'count' | 'percent' | 'usd';
  description: string;
  categories: string[];
  amplitude: number;
  noise: number;
  trend: number;
  macroWeight: number;
  shockImpact: number;
}

const outputDir = path.join(process.cwd(), 'public', 'data');
const weeksCount = 104;
const windowWeeks = 6;

const categories = ['All', 'Ops', 'Sales', 'Finance', 'Tech', 'Healthcare'];

const baseProfile = {
  All: {
    postings: 18000,
    remoteShare: 0.3,
    wageMedian: 82000,
    layoffs: 70,
    applications: 22,
    acceptRate: 0.62,
    newPostings: 7200
  },
  Ops: {
    postings: 6800,
    remoteShare: 0.22,
    wageMedian: 68000,
    layoffs: 45,
    applications: 26,
    acceptRate: 0.6,
    newPostings: 1400
  },
  Sales: {
    postings: 7200,
    remoteShare: 0.25,
    wageMedian: 78000,
    layoffs: 40,
    applications: 24,
    acceptRate: 0.58,
    newPostings: 1500
  },
  Finance: {
    postings: 5200,
    remoteShare: 0.2,
    wageMedian: 95000,
    layoffs: 50,
    applications: 20,
    acceptRate: 0.61,
    newPostings: 1100
  },
  Tech: {
    postings: 8000,
    remoteShare: 0.45,
    wageMedian: 120000,
    layoffs: 85,
    applications: 28,
    acceptRate: 0.55,
    newPostings: 2100
  },
  Healthcare: {
    postings: 7600,
    remoteShare: 0.18,
    wageMedian: 76000,
    layoffs: 35,
    applications: 19,
    acceptRate: 0.66,
    newPostings: 1900
  }
};

const signalConfigs: SignalConfig[] = [
  {
    key: 'job_postings_total',
    label: 'Job postings total',
    unit: 'count',
    description: 'Total weekly job postings across boards.',
    categories,
    amplitude: 0.08,
    noise: 0.05,
    trend: 0.0015,
    macroWeight: 0.25,
    shockImpact: -0.14
  },
  {
    key: 'job_postings_remote_share',
    label: 'Remote share of postings',
    unit: 'percent',
    description: 'Estimated share of postings marked remote.',
    categories,
    amplitude: 0.04,
    noise: 0.02,
    trend: 0.0004,
    macroWeight: 0.18,
    shockImpact: 0.02
  },
  {
    key: 'wage_median',
    label: 'Median wage',
    unit: 'usd',
    description: 'Median advertised wage.',
    categories,
    amplitude: 0.03,
    noise: 0.015,
    trend: 0.0012,
    macroWeight: 0.2,
    shockImpact: -0.05
  },
  {
    key: 'layoff_events',
    label: 'Layoff events',
    unit: 'count',
    description: 'Reported layoff events per week.',
    categories,
    amplitude: 0.12,
    noise: 0.1,
    trend: -0.0002,
    macroWeight: -0.18,
    shockImpact: 0.28
  },
  {
    key: 'applications_per_posting',
    label: 'Applications per posting',
    unit: 'count',
    description: 'Average applicant volume per posting.',
    categories,
    amplitude: 0.07,
    noise: 0.04,
    trend: 0.0008,
    macroWeight: 0.22,
    shockImpact: 0.12
  },
  {
    key: 'offer_accept_rate',
    label: 'Offer acceptance rate',
    unit: 'percent',
    description: 'Estimated share of offers accepted.',
    categories,
    amplitude: 0.03,
    noise: 0.02,
    trend: -0.0006,
    macroWeight: -0.12,
    shockImpact: -0.05
  },
  {
    key: 'new_postings_ops_roles',
    label: 'New postings - Ops roles',
    unit: 'count',
    description: 'Weekly new postings tagged Ops.',
    categories: ['Ops'],
    amplitude: 0.1,
    noise: 0.06,
    trend: 0.001,
    macroWeight: 0.28,
    shockImpact: -0.16
  },
  {
    key: 'new_postings_sales_roles',
    label: 'New postings - Sales roles',
    unit: 'count',
    description: 'Weekly new postings tagged Sales.',
    categories: ['Sales'],
    amplitude: 0.1,
    noise: 0.06,
    trend: 0.001,
    macroWeight: 0.28,
    shockImpact: -0.16
  },
  {
    key: 'new_postings_finance_roles',
    label: 'New postings - Finance roles',
    unit: 'count',
    description: 'Weekly new postings tagged Finance.',
    categories: ['Finance'],
    amplitude: 0.1,
    noise: 0.06,
    trend: 0.001,
    macroWeight: 0.28,
    shockImpact: -0.16
  },
  {
    key: 'new_postings_tech_roles',
    label: 'New postings - Tech roles',
    unit: 'count',
    description: 'Weekly new postings tagged Tech.',
    categories: ['Tech'],
    amplitude: 0.11,
    noise: 0.06,
    trend: 0.0012,
    macroWeight: 0.3,
    shockImpact: -0.2
  },
  {
    key: 'new_postings_healthcare_roles',
    label: 'New postings - Healthcare roles',
    unit: 'count',
    description: 'Weekly new postings tagged Healthcare.',
    categories: ['Healthcare'],
    amplitude: 0.09,
    noise: 0.05,
    trend: 0.0006,
    macroWeight: 0.24,
    shockImpact: -0.12
  },
  {
    key: 'new_postings_total',
    label: 'New postings total',
    unit: 'count',
    description: 'Weekly new postings across categories.',
    categories: ['All'],
    amplitude: 0.08,
    noise: 0.05,
    trend: 0.0012,
    macroWeight: 0.25,
    shockImpact: -0.15
  }
];

const sources = {
  job_postings_total: 'indeed_mock',
  job_postings_remote_share: 'linkedin_mock',
  wage_median: 'bls_mock',
  layoff_events: 'layoffs_mock',
  applications_per_posting: 'greenhouse_mock',
  offer_accept_rate: 'sample',
  new_postings_ops_roles: 'ats_mock',
  new_postings_sales_roles: 'ats_mock',
  new_postings_finance_roles: 'ats_mock',
  new_postings_tech_roles: 'ats_mock',
  new_postings_healthcare_roles: 'ats_mock',
  new_postings_total: 'ats_mock'
} as const;

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const random = mulberry32(42);
const randNormal = (mean = 0, std = 1) => {
  const u = 1 - random();
  const v = random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const compressionWindows = [
  { start: 26, end: 40 },
  { start: 70, end: 84 }
];

const compressionLevel = (index: number) => {
  let level = 0;
  compressionWindows.forEach((window) => {
    if (index >= window.start && index <= window.end) {
      const midpoint = (window.start + window.end) / 2;
      const span = window.end - window.start;
      const distance = Math.abs(index - midpoint);
      level = Math.max(level, 1 - distance / (span / 2));
    }
  });
  return clamp(level, 0, 1);
};

const shockCenters = [34, 78, 96];
const shockPulse = (index: number) => {
  return shockCenters.reduce((sum, center) => {
    const distance = (index - center) / 2.4;
    return sum + Math.exp(-distance * distance);
  }, 0);
};

const weekList = () => {
  const today = new Date();
  const day = today.getDay();
  const offset = (day + 6) % 7;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - offset);

  const weeks: string[] = [];
  for (let i = weeksCount - 1; i >= 0; i -= 1) {
    const date = new Date(lastMonday);
    date.setDate(lastMonday.getDate() - i * 7);
    weeks.push(date.toISOString().slice(0, 10));
  }
  return weeks;
};

const macroByCategory = (weeks: string[]) => {
  const map: Record<string, number[]> = {};
  categories.forEach((category, idx) => {
    const phase = idx * 0.4;
    let walk = 0;
    map[category] = weeks.map((_, i) => {
      walk += randNormal(0, 0.002);
      const seasonal = 0.03 * Math.sin((2 * Math.PI * i) / 52 + phase);
      const slow = 0.02 * Math.sin((2 * Math.PI * i) / 104 + phase / 2);
      return seasonal + slow + walk;
    });
  });
  return map;
};

const baseValue = (signalKey: string, category: string) => {
  const profile = baseProfile[category as keyof typeof baseProfile];
  switch (signalKey) {
    case 'job_postings_total':
      return profile.postings;
    case 'job_postings_remote_share':
      return profile.remoteShare;
    case 'wage_median':
      return profile.wageMedian;
    case 'layoff_events':
      return profile.layoffs;
    case 'applications_per_posting':
      return profile.applications;
    case 'offer_accept_rate':
      return profile.acceptRate;
    case 'new_postings_total':
      return profile.newPostings;
    default:
      return profile.newPostings;
  }
};

const noteForShock = (shock: number) => (Math.abs(shock) > 0.12 ? 'Macro shock period' : undefined);

const generate = async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const weeks = weekList();
  const macros = macroByCategory(weeks);

  const seriesMap = new Map<string, { signalKey: string; category: string; source: string; unit: string; points: { week: string; value: number; notes?: string }[] }>();

  categories.forEach((category) => {
    signalConfigs
      .filter((signal) => signal.categories.includes(category))
      .forEach((signal) => {
        const key = `${signal.key}-${category}`;
        const source = sources[signal.key as keyof typeof sources] ?? 'sample';
        const seasonPhase = random() * 0.6;
        const points = weeks.map((week, index) => {
          const season = signal.amplitude * Math.sin((2 * Math.PI * index) / 52 + seasonPhase);
          const compression = compressionLevel(index);
          const macro = macros[category][index] * (signal.macroWeight + compression * 0.25);
          const shock = shockPulse(index) * signal.shockImpact * (category === 'Tech' ? 1.2 : 1);
          const noise = randNormal(0, signal.noise * (1 - compression * 0.5));
          const trend = signal.trend * (index - weeksCount / 2);
          const base = baseValue(signal.key, category);

          let value: number;
          if (signal.unit === 'percent') {
            value = clamp(base + season + macro + noise + shock + trend, 0.05, 0.95);
          } else {
            value = base * (1 + season + macro + noise + shock + trend);
            value = Math.max(0, value);
          }

          return {
            week,
            value: Number(value.toFixed(2)),
            notes: noteForShock(shock)
          };
        });

        seriesMap.set(key, {
          signalKey: signal.key,
          category,
          source,
          unit: signal.unit,
          points
        });
      });
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    windowWeeks,
    series: Array.from(seriesMap.values()),
    signals: signalConfigs.map(({ key, label, unit, description }) => ({
      key,
      label,
      unit,
      description
    }))
  };

  await fs.writeFile(path.join(outputDir, 'series.json'), JSON.stringify(payload, null, 2));
};

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
