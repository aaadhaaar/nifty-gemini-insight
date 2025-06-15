
import React from 'react';
import { Activity, Clock, Cpu } from 'lucide-react';

interface StatusBarProps {
  lastApiCall: Date | null;
  apiCallsToday: number;
  userActive: boolean;
  getStrategicInterval: () => number;
  lastUpdate: string;
}

const StatusBar = ({ lastApiCall, apiCallsToday, userActive, getStrategicInterval, lastUpdate }: StatusBarProps) => {
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
    
    const strategicInterval = getStrategicInterval();
    const nextCallTime = new Date(lastApiCall.getTime() + strategicInterval);
    const now = new Date();
    
    if (nextCallTime <= now) return 'Soon';
    
    const diffInMinutes = Math.floor((nextCallTime.getTime() - now.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  };

  const getApiEfficiency = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 16) return 'Market Hours';
    if (hour >= 7 && hour < 9) return 'Pre-Market';
    if (hour >= 16 && hour < 18) return 'Post-Market';
    if (hour >= 18 && hour < 22) return 'Global Watch';
    return 'Night Mode';
  };

  const getUsageColor = () => {
    if (apiCallsToday >= 55) return 'from-red-500 to-red-600';
    if (apiCallsToday >= 40) return 'from-yellow-500 to-orange-500';
    if (apiCallsToday >= 20) return 'from-green-500 to-emerald-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass-morphism border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            {/* API Usage */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getUsageColor()}`} />
                <div className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${getUsageColor()} animate-ping opacity-75`} />
              </div>
              <div className="text-xs">
                <span className="text-white font-medium">{apiCallsToday}</span>
                <span className="text-slate-400">/60 calls</span>
              </div>
            </div>

            {/* Activity Status */}
            <div className="flex items-center space-x-2">
              <Activity className={`w-3 h-3 ${userActive ? 'text-green-400' : 'text-slate-500'}`} />
              <span className="text-xs text-slate-400">
                {userActive ? 'Active' : 'Idle'}
              </span>
            </div>

            {/* Last API Call */}
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">
                Last: {getTimeSinceLastCall()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* API Mode */}
            <div className="flex items-center space-x-2">
              <Cpu className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-300 font-medium">
                {getApiEfficiency()}
              </span>
            </div>

            {/* Next Update */}
            <div className="text-xs text-slate-400">
              Next: <span className="text-white">{getNextCallTime()}</span>
            </div>

            {/* UI Update */}
            <div className="text-xs text-slate-500">
              UI: {lastUpdate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
