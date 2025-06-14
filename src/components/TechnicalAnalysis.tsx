
import React from 'react';
import MarketOverview from './technical/MarketOverview';
import TechnicalIndicators from './technical/TechnicalIndicators';
import KeyLevels from './technical/KeyLevels';
import ChartPatterns from './technical/ChartPatterns';

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
      { name: 'RSI', value: '68', signal: 'neutral', description: 'Approaching overbought zone' },
      { name: 'MACD', value: 'Bullish crossover', signal: 'bullish', description: 'Signal line above MACD line' },
      { name: 'Moving Averages', value: '20 > 50 > 200', signal: 'bullish', description: 'All major MAs in bullish alignment' },
      { name: 'Volume', value: '15% above avg', signal: 'bullish', description: 'Strong buying interest' }
    ],
    patterns: [
      { name: 'Ascending Triangle', timeframe: 'Daily', probability: 75, target: 25200 },
      { name: 'Bull Flag', timeframe: 'Hourly', probability: 65, target: 24750 }
    ]
  };

  return (
    <div className="space-y-6">
      <MarketOverview
        niftyLevel={technicalData.niftyLevel}
        resistance={technicalData.resistance}
        support={technicalData.support}
        overallTrend={technicalData.overallTrend}
      />
      
      <TechnicalIndicators indicators={technicalData.indicators} />
      
      <KeyLevels levels={technicalData.keyLevels} />
      
      <ChartPatterns patterns={technicalData.patterns} />
    </div>
  );
};

export default TechnicalAnalysis;
