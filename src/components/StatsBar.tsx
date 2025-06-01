
import React from 'react';
import { TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';

interface StatsBarProps {
  totalNews: number;
  bullishNews: number;
  bearishNews: number;
  lastUpdate: string;
}

const StatsBar: React.FC<StatsBarProps> = ({ totalNews, bullishNews, bearishNews, lastUpdate }) => {
  return (
    <div className="glass-effect rounded-2xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Eye className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalNews}</p>
            <p className="text-sm text-gray-400">Total News</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{bullishNews}</p>
            <p className="text-sm text-gray-400">Bullish</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{bearishNews}</p>
            <p className="text-sm text-gray-400">Bearish</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Last Update</p>
            <p className="text-sm text-gray-400">{lastUpdate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
