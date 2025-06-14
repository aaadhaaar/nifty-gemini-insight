
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface MarketOverviewProps {
  stockSymbol?: string;
  currentLevel: number;
  resistance: number;
  support: number;
  overallTrend: string;
}

const MarketOverview = ({ stockSymbol, currentLevel, resistance, support, overallTrend }: MarketOverviewProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>{stockSymbol ? `${stockSymbol} Overview` : 'Market Overview'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-sm">Current Level</p>
            <p className="text-white font-bold text-lg">₹{currentLevel}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-sm">Resistance</p>
            <p className="text-red-400 font-bold text-lg">₹{resistance}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-sm">Support</p>
            <p className="text-green-400 font-bold text-lg">₹{support}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-slate-400 text-sm">Trend</p>
            <p className={`font-bold text-lg capitalize ${overallTrend === 'bullish' ? 'text-green-400' : overallTrend === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
              {overallTrend}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
