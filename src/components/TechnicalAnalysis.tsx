
import React from 'react';
import MarketOverview from './technical/MarketOverview';
import TechnicalIndicators from './technical/TechnicalIndicators';
import KeyLevels from './technical/KeyLevels';
import ChartPatterns from './technical/ChartPatterns';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface TechnicalAnalysisProps {
  selectedStock?: Stock;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ selectedStock }) => {
  // Generate mock technical data based on selected stock
  const generateTechnicalData = (stock?: Stock) => {
    if (!stock) {
      return {
        overallTrend: 'neutral',
        currentLevel: 0,
        resistance: 0,
        support: 0,
        rsi: 50,
        macd: 'neutral',
        volumeProfile: 'average',
        keyLevels: [],
        indicators: [],
        patterns: []
      };
    }

    // Generate realistic mock data based on stock
    const basePrice = Math.random() * 2000 + 500; // 500-2500 range
    const volatility = Math.random() * 0.1 + 0.02; // 2-12% volatility
    
    const currentLevel = Math.round(basePrice);
    const resistance = Math.round(basePrice * (1 + volatility));
    const support = Math.round(basePrice * (1 - volatility));
    const rsi = Math.round(Math.random() * 40 + 30); // 30-70 range
    
    const trends = ['bullish', 'bearish', 'neutral'];
    const overallTrend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      overallTrend,
      currentLevel,
      resistance,
      support,
      rsi,
      macd: overallTrend === 'bullish' ? 'positive' : overallTrend === 'bearish' ? 'negative' : 'neutral',
      volumeProfile: Math.random() > 0.5 ? 'above_average' : 'below_average',
      keyLevels: [
        { level: resistance, type: 'resistance', strength: 'strong' },
        { level: Math.round(basePrice * 1.03), type: 'resistance', strength: 'weak' },
        { level: Math.round(basePrice * 0.98), type: 'support', strength: 'moderate' },
        { level: support, type: 'support', strength: 'strong' }
      ],
      indicators: [
        { name: 'RSI', value: rsi.toString(), signal: rsi > 65 ? 'bearish' : rsi < 35 ? 'bullish' : 'neutral', description: `Current reading at ${rsi}` },
        { name: 'MACD', value: overallTrend === 'bullish' ? 'Bullish crossover' : 'Bearish divergence', signal: overallTrend, description: 'Signal line momentum' },
        { name: 'Moving Averages', value: '20 > 50 > 200', signal: overallTrend, description: 'All major MAs in alignment' },
        { name: 'Volume', value: Math.random() > 0.5 ? '15% above avg' : '8% below avg', signal: Math.random() > 0.5 ? 'bullish' : 'bearish', description: 'Trading activity level' }
      ],
      patterns: [
        { name: 'Ascending Triangle', timeframe: 'Daily', probability: Math.round(Math.random() * 30 + 60), target: Math.round(basePrice * 1.08) },
        { name: 'Bull Flag', timeframe: 'Hourly', probability: Math.round(Math.random() * 20 + 55), target: Math.round(basePrice * 1.05) }
      ]
    };
  };

  const technicalData = generateTechnicalData(selectedStock);

  if (!selectedStock) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
        <p className="text-slate-400 mb-2">Select a stock to view technical analysis</p>
        <p className="text-xs text-slate-500">Use the search above to choose any Nifty 50 stock</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          {selectedStock.symbol} Technical Analysis
        </h2>
        <p className="text-slate-400 text-sm">
          Comprehensive technical insights for {selectedStock.name}
        </p>
      </div>
      
      <MarketOverview
        stockSymbol={selectedStock.symbol}
        currentLevel={technicalData.currentLevel}
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
