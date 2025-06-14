
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stock {
  symbol: string;
}

interface MarketNewsEmptyStateProps {
  selectedStock?: Stock;
  onRefetch: () => void;
}

const MarketNewsEmptyState: React.FC<MarketNewsEmptyStateProps> = ({
  selectedStock,
  onRefetch
}) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
      <p className="text-slate-400 mb-2">
        {selectedStock 
          ? `No recent events found for ${selectedStock.symbol}`
          : 'No market events available'
        }
      </p>
      <p className="text-xs text-slate-500">
        {selectedStock 
          ? 'Try searching for another stock or check back later'
          : 'AI analysis will appear as market events develop'
        }
      </p>
      <Button onClick={onRefetch} variant="outline" size="sm" className="mt-4">
        <RefreshCw className="w-4 h-4 mr-2" />
        Scan for Events
      </Button>
    </div>
  );
};

export default MarketNewsEmptyState;
