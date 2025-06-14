
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface Indicator {
  name: string;
  value: string;
  signal: string;
  description: string;
}

interface TechnicalIndicatorsProps {
  indicators: Indicator[];
}

const TechnicalIndicators = ({ indicators }: TechnicalIndicatorsProps) => {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish': return <TrendingUp className="w-4 h-4" />;
      case 'bearish': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-400" />
          <span>Technical Indicators</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={getSignalColor(indicator.signal)}>
                  {getSignalIcon(indicator.signal)}
                </div>
                <div>
                  <p className="text-white font-medium">{indicator.name}</p>
                  <p className="text-slate-400 text-sm">{indicator.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{indicator.value}</p>
                <p className={`text-sm capitalize ${getSignalColor(indicator.signal)}`}>
                  {indicator.signal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalIndicators;
