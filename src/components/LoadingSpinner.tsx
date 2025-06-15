
import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute inset-2 w-20 h-20 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <p className="text-slate-300 font-medium">Analyzing market intelligence</p>
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
