
import React from 'react';
import { Brain, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stock {
  symbol: string;
  name: string;
}

interface MarketNewsHeaderProps {
  selectedStock?: Stock;
  onRefetch: () => void;
  isFetching: boolean;
}

const MarketNewsHeader: React.FC<MarketNewsHeaderProps> = ({
  selectedStock,
  onRefetch,
  isFetching
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {selectedStock ? `${selectedStock.symbol} News & Events` : 'Market Events Intelligence'}
          </h2>
          <p className="text-sm text-slate-400">
            {selectedStock 
              ? `AI-powered insights for ${selectedStock.name}`
              : 'AI-powered market events • Real-time analysis'
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onRefetch} 
          variant="outline" 
          size="sm"
          disabled={isFetching}
          className="text-xs"
        >
          {isFetching ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
        </Button>
        <div className="flex items-center space-x-2">
          <Wifi className="w-3 h-3 text-green-400" />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
    </div>
  );
};

export default MarketNewsHeader;
