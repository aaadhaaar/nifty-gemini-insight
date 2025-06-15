
export const getImpactStrength = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 2.5) return 'Extreme';
  if (absValue >= 2.0) return 'Very Strong';
  if (absValue >= 1.5) return 'Strong';
  if (absValue >= 1.0) return 'Moderate';
  if (absValue >= 0.5) return 'Weak';
  return 'Minimal';
};

export const getImpactDirection = (value: number): string => {
  if (value > 0.5) return 'Bullish';
  if (value < -0.5) return 'Bearish';
  return 'Neutral';
};

export const getImpactColor = (value: number): string => {
  if (value > 1.5) return 'text-green-400';
  if (value > 0.5) return 'text-emerald-400';
  if (value < -1.5) return 'text-red-400';
  if (value < -0.5) return 'text-orange-400';
  return 'text-yellow-400';
};

export const getImpactBgColor = (value: number): string => {
  if (value > 1.5) return 'bg-green-500/20 border-green-500/30';
  if (value > 0.5) return 'bg-emerald-500/20 border-emerald-500/30';
  if (value < -1.5) return 'bg-red-500/20 border-red-500/30';
  if (value < -0.5) return 'bg-orange-500/20 border-orange-500/30';
  return 'bg-yellow-500/20 border-yellow-500/30';
};
