
import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Target } from 'lucide-react';
import { getSentimentFromImpact, getSentimentColor, getImpactStrength } from '@/utils/impactAnalysisUtils';

interface ImpactMetricsCardProps {
  overallImpact: number;
  averageConfidence: number;
  analysisCount: number;
  selectedStock?: { symbol: string; name: string; sector: string };
}

const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'bullish': return <TrendingUp className="w-5 h-5" />;
    case 'bearish': return <TrendingDown className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
};

const ImpactMetricsCard: React.FC<ImpactMetricsCardProps> = ({
  overallImpact,
  averageConfidence,
  analysisCount,
  selectedStock
}) => {
  const overallSentiment = getSentimentFromImpact(overallImpact);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-700/30 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={getSentimentColor(overallSentiment)}>
            {getSentimentIcon(overallSentiment)}
          </div>
          <h3 className="font-semibold text-white">Market Sentiment</h3>
        </div>
        <p className={`text-lg font-bold capitalize ${getSentimentColor(overallSentiment)}`}>
          {overallSentiment}
        </p>
        <p className="text-sm text-slate-400">
          Impact: {overallImpact > 0 ? '+' : ''}{overallImpact.toFixed(2)} points
        </p>
      </div>

      <div className="bg-slate-700/30 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Analysis Strength</h3>
        </div>
        <p className="text-lg font-bold text-blue-400">
          {getImpactStrength(overallImpact)}
        </p>
        <p className="text-sm text-slate-400">
          Confidence: {averageConfidence.toFixed(0)}%
        </p>
      </div>

      <div className="bg-slate-700/30 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Events Analyzed</h3>
        </div>
        <p className="text-lg font-bold text-purple-400">{analysisCount}</p>
        <p className="text-sm text-slate-400">
          {selectedStock ? 'Stock-specific' : 'Market-wide'}
        </p>
      </div>
    </div>
  );
};

export default ImpactMetricsCard;
