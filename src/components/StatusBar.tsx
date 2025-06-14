
import React from 'react';
import { Wifi, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  isRefreshing: boolean;
  apiCallsToday: number;
  lastApiCall: Date | null;
  userActive: boolean;
  selectedStock: { symbol: string };
  lastUpdate: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  isRefreshing,
  apiCallsToday,
  lastApiCall,
  userActive,
  selectedStock,
  lastUpdate
}) => {
  const getTimeSinceLastCall = () => {
    if (!lastApiCall) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastApiCall.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  };

  const getNextCallTime = () => {
    if (!lastApiCall) return 'Soon';
    if (apiCallsToday >= 60) return 'Tomorrow';
    
    const getSmartInterval = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 9 && hour <= 16) {
        return userActive ? 45 * 60 * 1000 : 90 * 60 * 1000;
      } else if (hour >= 17 && hour <= 22) {
        return userActive ? 90 * 60 * 1000 : 3 * 60 * 60 * 1000;
      } else {
        return 6 * 60 * 60 * 1000;
      }
    };

    const smartInterval = getSmartInterval();
    const nextCallTime = new Date(lastApiCall.getTime() + smartInterval);
    const now = new Date();
    
    if (nextCallTime <= now) return 'Soon';
    
    const diffInMinutes = Math.floor((nextCallTime.getTime() - now.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : apiCallsToday >= 60 ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="text-xs text-slate-400">
              {apiCallsToday}/60 calls • Last: {getTimeSinceLastCall()}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Next: {getNextCallTime()} • {userActive ? 'Active' : 'Idle'}
          </div>
          <div className="text-xs text-slate-400">
            Analyzing: {selectedStock.symbol}
          </div>
        </div>
        <span className="text-xs text-slate-400">
          UI: {lastUpdate}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
