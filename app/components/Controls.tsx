'use client';

interface ControlsProps {
  categories: string[];
  selectedCategory: string;
  selectedRange: number;
  showEvents: boolean;
  onCategoryChange: (value: string) => void;
  onRangeChange: (value: number) => void;
  onToggleEvents: (value: boolean) => void;
}

const ranges = [
  { label: '26 weeks', value: 26 },
  { label: '52 weeks', value: 52 },
  { label: '104 weeks', value: 104 }
];

export default function Controls({
  categories,
  selectedCategory,
  selectedRange,
  showEvents,
  onCategoryChange,
  onRangeChange,
  onToggleEvents
}: ControlsProps) {
  return (
    <section className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4 md:p-5">
      <div className="flex min-w-[180px] flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-muted">Category</span>
        <select
          className="rounded-xl border border-line/70 bg-canvas/60 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category} className="bg-canvas">
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-[180px] flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-muted">Time Range</span>
        <select
          className="rounded-xl border border-line/70 bg-canvas/60 px-3 py-2 text-sm text-white outline-none transition focus:border-accent"
          value={selectedRange}
          onChange={(event) => onRangeChange(Number(event.target.value))}
        >
          {ranges.map((range) => (
            <option key={range.value} value={range.value} className="bg-canvas">
              {range.label}
            </option>
          ))}
        </select>
      </div>
      <div className="ml-auto flex items-center gap-3 text-sm text-muted">
        <span>Show synchronization events</span>
        <button
          type="button"
          className={`relative h-6 w-11 rounded-full border border-line/60 transition ${
            showEvents ? 'bg-accent/60' : 'bg-canvas/80'
          }`}
          onClick={() => onToggleEvents(!showEvents)}
          aria-pressed={showEvents}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
              showEvents ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </section>
  );
}
