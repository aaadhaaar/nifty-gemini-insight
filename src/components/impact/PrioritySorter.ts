
/**
 * Sort an array of impact analysis items by calculated priority and impact.
 */
export const sortByPriorityAndImpact = (data: any[]) => {
  return [...data].sort((a, b) => {
    const impactA = Math.abs(a.expected_points_impact || 0);
    const impactB = Math.abs(b.expected_points_impact || 0);
    const confidenceA = a.confidence_score || 0;
    const confidenceB = b.confidence_score || 0;
    
    const getPriorityScore = (impact: number, confidence: number, d: any) => {
      let score = impact * 10;
      if (confidence >= 90) score *= 1.5;
      else if (confidence >= 80) score *= 1.2;
      else if (confidence >= 70) score *= 1.0;
      else score *= 0.8;
      if (impact >= 2) score += 50;
      else if (impact >= 1.5) score += 30;
      else if (impact >= 1) score += 15;
      const hoursOld = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 1) score += 5;
      else if (hoursOld < 6) score += 2;
      return score;
    };
    const scoreA = getPriorityScore(impactA, confidenceA, a);
    const scoreB = getPriorityScore(impactB, confidenceB, b);
    return scoreB - scoreA;
  });
};
