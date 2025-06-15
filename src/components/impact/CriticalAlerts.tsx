
import React from 'react';
import { Flame } from 'lucide-react';

interface MarketSummary {
  criticalEvents: number;
  marketMomentum: string;
}

interface CriticalAlertsProps {
  marketSummary: MarketSummary;
}

const CriticalAlerts: React.FC<CriticalAlertsProps> = ({ marketSummary }) => {
  if (marketSummary.criticalEvents === 0) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
      <div className="flex items-center space-x-2 mb-2">
        <Flame className="w-5 h-5 text-red-400 animate-pulse" />
        <span className="text-sm font-medium text-red-300">CRITICAL MARKET ALERTS</span>
      </div>
      <p className="text-sm text-slate-300">
        {marketSummary.criticalEvents} high-impact event{marketSummary.criticalEvents > 1 ? 's' : ''} detected. 
        Immediate market response expected. Current momentum: <span className="font-bold text-white">{marketSummary.marketMomentum}</span>
      </p>
    </div>
  );
};

export default CriticalAlerts;
