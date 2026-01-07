const format = (value, decimals = 2) => {
    if (value === null || Number.isNaN(value))
        return 'n/a';
    return value.toFixed(decimals);
};
const formatDelta = (value) => {
    if (value === null || Number.isNaN(value))
        return 'n/a';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
};
const trendLabel = (value) => {
    if (value === null || Number.isNaN(value))
        return 'steady';
    if (value > 0.02)
        return 'up';
    if (value < -0.02)
        return 'down';
    return 'steady';
};
const strengthLabel = (value) => {
    if (value === null || Number.isNaN(value))
        return 'unclear';
    if (value > 0.55)
        return 'strong';
    if (value > 0.4)
        return 'moderate';
    return 'soft';
};
const clusterLabel = (value) => {
    if (value === null || Number.isNaN(value))
        return 'insufficient data';
    if (value > 0.8)
        return 'cluster memberships held steady';
    if (value > 0.6)
        return 'clusters shifted modestly';
    return 'clusters reshuffled noticeably';
};
export const analyze = ({ category, current, previous }) => {
    const prevVariance = previous?.varianceIndex ?? null;
    const prevCorrelation = previous?.avgAbsCorrelation ?? null;
    const varianceDelta = prevVariance !== null && current.varianceIndex !== null
        ? current.varianceIndex - prevVariance
        : null;
    const correlationDelta = prevCorrelation !== null && current.avgAbsCorrelation !== null
        ? current.avgAbsCorrelation - prevCorrelation
        : null;
    const interpretation = varianceDelta !== null && correlationDelta !== null
        ? varianceDelta < -0.02 && correlationDelta > 0.01
            ? 'signals are compressing as dispersion falls and alignment strengthens'
            : varianceDelta > 0.02 && correlationDelta < -0.01
                ? 'signals are dispersing as alignment softens'
                : 'signals show mixed alignment with no sharp regime shift'
        : 'signals lack enough history for a firm structure call';
    const paragraph1 = `This week's structure readout for ${category} compares normalized postings, wage, and demand proxies ` +
        'so that units do not dominate the signals. ' +
        `The variance index is ${format(current.varianceIndex)}, ${trendLabel(varianceDelta)} versus last week, ` +
        'where lower values imply compression and higher values imply dispersion. ' +
        `Average absolute correlation is ${format(current.avgAbsCorrelation)} with velocity at ${format(current.correlationVelocity)}, ` +
        'capturing whether alignment across signals is accelerating or fading. ' +
        `Together this suggests ${interpretation}.`;
    const paragraph2 = `Cluster stability is ${format(current.clusterStability)}, meaning ${clusterLabel(current.clusterStability)}. ` +
        `Rolling correlations are ${strengthLabel(current.avgAbsCorrelation)}, suggesting how tightly groups of ` +
        'signals are moving together in the latest window. ' +
        `This week ${current.syncEvent ? 'a synchronization event is flagged because variance dipped and velocity rose.' : 'no synchronization event is flagged under the current thresholds.'}`;
    const paragraph3 = 'These results are descriptive and conservative, built from weekly aggregates and simple normalization. ' +
        'They highlight where independent data starts to move together, not why it happens. ' +
        'No prediction. Pattern-only. Correlation ≠ causation.';
    const bullets = [
        `Variance Index: ${format(current.varianceIndex)} (${formatDelta(varianceDelta)})`,
        `Avg Abs Correlation: ${format(current.avgAbsCorrelation)} (${formatDelta(correlationDelta)})`,
        current.syncEvent ? 'Synchronization event flagged this week.' : `Cluster Stability: ${format(current.clusterStability)}`
    ];
    return {
        title: "This week's structure",
        body: `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`,
        bullets
    };
};
