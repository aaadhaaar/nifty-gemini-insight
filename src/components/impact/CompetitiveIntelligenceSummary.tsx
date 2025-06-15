
import React from 'react';
import { Brain } from 'lucide-react';

interface MarketSummary {
  totalImpact: number;
  totalImpactStrength: string;
  totalImpactDirection: string;
  strongPositive: number;
  strongNegative: number;
  avgConfidence: number;
  criticalEvents: number;
  latestUpdate?: string;
}

interface CompetitiveIntelligenceSummaryProps {
  marketSummary: MarketSummary;
  getImpactColor: (value: number) => string;
}

const CompetitiveIntelligenceSummary: React.FC<CompetitiveIntelligenceSummaryProps> = ({
  marketSummary,
  getImpactColor
}) => {
  return (
    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <Brain className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-indigo-300">Competitive Intelligence Summary</span>
      </div>
      <p className="text-sm text-slate-300 mb-3">
        Elite analysis reveals <span className={`font-medium ${getImpactColor(marketSummary.totalImpact)}`}>
          {marketSummary.totalImpactStrength.toLowerCase()} {marketSummary.totalImpactDirection.toLowerCase()}
        </span> market sentiment. Intelligence includes {marketSummary.strongPositive} bullish and {marketSummary.strongNegative} bearish 
        signals with {marketSummary.avgConfidence}% average confidence. 
        {marketSummary.criticalEvents > 0 && (
          <span className="text-red-400 font-medium"> {marketSummary.criticalEvents} critical alert{marketSummary.criticalEvents > 1 ? 's' : ''} active.</span>
        )}
      </p>
      {marketSummary.latestUpdate && (
        <div className="text-xs text-slate-400">
          Last intelligence update: {new Date(marketSummary.latestUpdate).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CompetitiveIntelligenceSummary;
