
import { useMemo } from 'react';
import { getImpactStrength, getImpactDirection, getImpactColor, getImpactBgColor } from './impactHelpers';

export const useMarketSummary = (displayData: any[]) => {
  return useMemo(() => {
    if (!displayData || displayData.length === 0) return null;
    const totalImpact = displayData.reduce((sum, item) => sum + (item.expected_points_impact || 0), 0);
    const strongPositive = displayData.filter(item => (item.expected_points_impact || 0) > 1);
    const strongNegative = displayData.filter(item => (item.expected_points_impact || 0) < -1);
    const criticalEvents = displayData.filter(item => Math.abs(item.expected_points_impact || 0) >= 2);
    const avgConfidence = displayData.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / displayData.length;
    return {
      totalImpact,
      totalImpactStrength: getImpactStrength(totalImpact),
      totalImpactDirection: getImpactDirection(totalImpact),
      strongPositive: strongPositive.length,
      strongNegative: strongNegative.length,
      criticalEvents: criticalEvents.length,
      avgConfidence: Math.round(avgConfidence),
      latestUpdate: displayData[0]?.created_at,
      marketMomentum: totalImpact > 1 ? 'Strong Bullish' : totalImpact < -1 ? 'Strong Bearish' : 'Consolidation'
    };
  }, [displayData]);
};
