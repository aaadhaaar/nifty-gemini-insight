
import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-gray-400 font-medium">Analyzing market insights...</p>
    </div>
  );
};

export default LoadingSpinner;
