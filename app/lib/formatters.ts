export const formatWeekShort = (week: string) => {
  const date = new Date(week);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatWeekLong = (week: string) => {
  const date = new Date(week);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const round = (value: number | null | undefined, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'n/a';
  return value.toFixed(decimals);
};
