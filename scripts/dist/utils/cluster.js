const distance = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};
export const kMeansClusters = (vectors, k, iterations = 12) => {
    const n = vectors.length;
    if (n === 0)
        return [];
    const actualK = Math.min(k, n);
    let centroids = vectors.slice(0, actualK).map((vector) => [...vector]);
    let assignments = new Array(n).fill(0);
    for (let iter = 0; iter < iterations; iter += 1) {
        assignments = vectors.map((vector) => {
            let bestIndex = 0;
            let bestDistance = Number.POSITIVE_INFINITY;
            centroids.forEach((centroid, index) => {
                const dist = distance(vector, centroid);
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestIndex = index;
                }
            });
            return bestIndex;
        });
        const sums = Array.from({ length: actualK }, () => new Array(vectors[0].length).fill(0));
        const counts = new Array(actualK).fill(0);
        assignments.forEach((cluster, idx) => {
            counts[cluster] += 1;
            vectors[idx].forEach((value, dim) => {
                sums[cluster][dim] += value;
            });
        });
        centroids = centroids.map((centroid, idx) => {
            if (counts[idx] === 0)
                return centroid;
            return sums[idx].map((value) => value / counts[idx]);
        });
    }
    return assignments;
};
export const clusterStabilityScore = (prev, current) => {
    if (!prev || !current || prev.length !== current.length || prev.length < 2) {
        return null;
    }
    const n = prev.length;
    let stablePairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
            const samePrev = prev[i] === prev[j];
            const sameCurrent = current[i] === current[j];
            if (samePrev === sameCurrent)
                stablePairs += 1;
            totalPairs += 1;
        }
    }
    if (totalPairs === 0)
        return null;
    return stablePairs / totalPairs;
};
