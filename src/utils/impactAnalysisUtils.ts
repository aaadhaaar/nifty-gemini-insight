
export const getSentimentFromImpact = (impact: number) => {
  if (impact > 0.3) return 'bullish';
  if (impact < -0.3) return 'bearish';
  return 'neutral';
};

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'bullish': return 'text-emerald-400';
    case 'bearish': return 'text-red-400';
    default: return 'text-yellow-400';
  }
};

export const getImpactStrength = (impact: number) => {
  const abs = Math.abs(impact);
  if (abs >= 1.5) return 'Very Strong';
  if (abs >= 1.0) return 'Strong';
  if (abs >= 0.5) return 'Moderate';
  return 'Weak';
};

export const getImpactColor = (impact: number) => {
  if (impact > 0.5) return 'bg-emerald-500/10 border-emerald-500/20';
  if (impact < -0.5) return 'bg-red-500/10 border-red-500/20';
  return 'bg-blue-500/10 border-blue-500/20';
};

export const getImpactStatusColor = (impact: number) => {
  if (impact > 0.5) return 'bg-emerald-400';
  if (impact < -0.5) return 'bg-red-400';
  return 'bg-blue-400';
};

export const getImpactStatusText = (impact: number) => {
  if (impact > 0) return 'POSITIVE';
  if (impact < 0) return 'NEGATIVE';
  return 'NEUTRAL';
};

export const getImpactStatusTextColor = (impact: number) => {
  if (impact > 0.5) return 'text-emerald-300';
  if (impact < -0.5) return 'text-red-300';
  return 'text-blue-300';
};
