export const mean = (values) => {
    if (values.length === 0)
        return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
};
export const variance = (values) => {
    if (values.length === 0)
        return 0;
    const avg = mean(values);
    return mean(values.map((value) => (value - avg) ** 2));
};
export const stdDev = (values) => Math.sqrt(variance(values));
export const pearson = (a, b) => {
    if (a.length !== b.length || a.length === 0)
        return 0;
    const meanA = mean(a);
    const meanB = mean(b);
    let numerator = 0;
    let denomA = 0;
    let denomB = 0;
    for (let i = 0; i < a.length; i += 1) {
        const diffA = a[i] - meanA;
        const diffB = b[i] - meanB;
        numerator += diffA * diffB;
        denomA += diffA ** 2;
        denomB += diffB ** 2;
    }
    const denominator = Math.sqrt(denomA * denomB);
    if (denominator === 0)
        return 0;
    return numerator / denominator;
};
export const percentile = (values, p) => {
    if (values.length === 0)
        return null;
    const sorted = [...values].sort((a, b) => a - b);
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper)
        return sorted[lower];
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};
