
import React from 'react';

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
    if (hour >= 9 && hour < 16) return 'Market Hours - High Priority';
    if (hour >= 7 && hour < 9) return 'Pre-Market - Strategic';
    if (hour >= 16 && hour < 18) return 'Post-Market - Analysis';
    if (hour >= 18 && hour < 22) return 'Global Watch - Moderate';
    return 'Overnight - Minimal';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              apiCallsToday >= 55 ? 'bg-red-400' : 
              apiCallsToday >= 40 ? 'bg-yellow-400' : 
              apiCallsToday >= 20 ? 'bg-green-400' : 'bg-blue-400'
            }`}></div>
            <span className="text-xs text-slate-400">
              {apiCallsToday}/60 • Last: {getTimeSinceLastCall()}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Next: {getNextCallTime()} • {userActive ? 'Active' : 'Idle'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-400">{getApiEfficiency()}</span>
          <span className="text-xs text-slate-400">
            UI: {lastUpdate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
