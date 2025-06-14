
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Activity, Target, AlertTriangle } from 'lucide-react';

const TechnicalAnalysis = () => {
  // Mock technical data - in a real app, this would come from an API
  const technicalData = {
    overallTrend: 'bullish',
    niftyLevel: 24500,
    resistance: 24800,
    support: 24200,
    rsi: 68,
    macd: 'positive',
    volumeProfile: 'above_average',
    keyLevels: [
      { level: 24800, type: 'resistance', strength: 'strong' },
      { level: 24650, type: 'resistance', strength: 'weak' },
      { level: 24350, type: 'support', strength: 'moderate' },
      { level: 24200, type: 'support', strength: 'strong' }
    ],
    indicators: [
      { name: 'RSI', value: 68, signal: 'neutral', description: 'Approaching overbought zone' },
      { name: 'MACD', value: 'Bullish crossover', signal: 'bullish', description: 'Signal line above MACD line' },
      { name: 'Moving Averages', value: '20 > 50 > 200', signal: 'bullish', description: 'All major MAs in bullish alignment' },
      { name: 'Volume', value: '15% above avg', signal: 'bullish', description: 'Strong buying interest' }
    ],
    patterns: [
      { name: 'Ascending Triangle', timeframe: 'Daily', probability: 75, target: 25200 },
      { name: 'Bull Flag', timeframe: 'Hourly', probability: 65, target: 24750 }
    ]
  };

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
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Market Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Current Level</p>
              <p className="text-white font-bold text-lg">{technicalData.niftyLevel}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Resistance</p>
              <p className="text-red-400 font-bold text-lg">{technicalData.resistance}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Support</p>
              <p className="text-green-400 font-bold text-lg">{technicalData.support}</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Trend</p>
              <p className={`font-bold text-lg capitalize ${technicalData.overallTrend === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                {technicalData.overallTrend}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>Technical Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {technicalData.indicators.map((indicator, index) => (
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

      {/* Key Levels */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-400" />
            <span>Key Levels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {technicalData.keyLevels.map((level, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-700/20 rounded">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${level.type === 'resistance' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span className="text-white font-medium">{level.level}</span>
                  <span className="text-slate-400 text-sm capitalize">({level.type})</span>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  level.strength === 'strong' ? 'bg-red-500/20 text-red-400' :
                  level.strength === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {level.strength}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Patterns */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Chart Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {technicalData.patterns.map((pattern, index) => (
              <div key={index} className="p-3 bg-slate-700/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{pattern.name}</h4>
                  <span className="text-slate-400 text-sm">{pattern.timeframe}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-slate-400 text-xs">Probability</p>
                      <p className="text-green-400 font-medium">{pattern.probability}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Target</p>
                      <p className="text-blue-400 font-medium">{pattern.target}</p>
                    </div>
                  </div>
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${pattern.probability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalAnalysis;
