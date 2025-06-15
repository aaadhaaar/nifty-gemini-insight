
import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Shield } from 'lucide-react';

interface MarketSummary {
  totalImpact: number;
  totalImpactStrength: string;
  totalImpactDirection: string;
  strongPositive: number;
  strongNegative: number;
  avgConfidence: number;
}

interface MarketSummaryCardsProps {
  marketSummary: MarketSummary;
  getImpactColor: (value: number) => string;
  getImpactBgColor: (value: number) => string;
}

const MarketSummaryCards: React.FC<MarketSummaryCardsProps> = ({
  marketSummary,
  getImpactColor,
  getImpactBgColor
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className={`rounded-xl p-3 border ${getImpactBgColor(marketSummary.totalImpact)}`}>
        <div className="flex items-center space-x-2 mb-1">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-blue-300">Net Signal</span>
        </div>
        <div className={`text-lg font-bold ${getImpactColor(marketSummary.totalImpact)}`}>
          {marketSummary.totalImpactStrength}
        </div>
        <div className="text-xs text-slate-400">{marketSummary.totalImpactDirection}</div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-3">
        <div className="flex items-center space-x-2 mb-1">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-300">Bullish</span>
        </div>
        <div className="text-lg font-bold text-emerald-400">{marketSummary.strongPositive}</div>
        <div className="text-xs text-slate-400">Signals</div>
      </div>

      <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-3">
        <div className="flex items-center space-x-2 mb-1">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-300">Bearish</span>
        </div>
        <div className="text-lg font-bold text-red-400">{marketSummary.strongNegative}</div>
        <div className="text-xs text-slate-400">Signals</div>
      </div>

      <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-purple-300">Confidence</span>
        </div>
        <div className="text-lg font-bold text-purple-400">{marketSummary.avgConfidence}%</div>
        <div className="text-xs text-slate-400">Average</div>
      </div>
    </div>
  );
};

export default MarketSummaryCards;
