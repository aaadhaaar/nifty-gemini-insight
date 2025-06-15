
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface ImpactAggressiveHeaderProps {
  isUsingFallback: boolean;
}

const ImpactAggressiveHeader: React.FC<ImpactAggressiveHeaderProps> = ({ isUsingFallback }) => {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
        <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8L21 10h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
      </div>
      <div className="flex-1">
        <h2 className="text-lg md:text-xl font-bold text-white">Competitive Intelligence Dashboard</h2>
        <p className="text-sm text-slate-400">
          {isUsingFallback ? 'Enhanced fallback mode • Fetching live market data...' : 'Elite market analysis • Real-time strategic insights'}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isUsingFallback ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
        <span className="text-xs text-slate-400">{isUsingFallback ? 'Acquiring' : 'Active'}</span>
        {isUsingFallback && <RefreshCw className="w-3 h-3 text-orange-400 animate-spin" />}
      </div>
    </div>
  );
};

export default ImpactAggressiveHeader;
