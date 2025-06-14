
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, BarChart3, Target } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface ImpactAnalysisProps {
  selectedStock?: Stock;
}

const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ selectedStock }) => {
  // Memoize the generated data to prevent it from changing on re-renders
  const analysisData = useMemo(() => {
    const generateMockData = (stock?: Stock) => {
      if (!stock) {
        return {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          priceTarget: 0,
          keyFactors: [],
          riskFactors: [],
          opportunities: []
        };
      }

      // Mock data generation based on stock characteristics
      const sectorMultipliers = {
        'Banking': { sentiment: 0.1, volatility: 0.8 },
        'IT Services': { sentiment: 0.3, volatility: 0.6 },
        'FMCG': { sentiment: 0.2, volatility: 0.4 },
        'Oil & Gas': { sentiment: -0.1, volatility: 1.2 },
        'Pharmaceuticals': { sentiment: 0.15, volatility: 0.7 },
        'Automobiles': { sentiment: 0.05, volatility: 0.9 }
      };

      const multiplier = sectorMultipliers[stock.sector as keyof typeof sectorMultipliers] || { sentiment: 0, volatility: 0.8 };
      
      // Use stock symbol as seed for consistent random values
      const seed = stock.symbol.charCodeAt(0) + stock.symbol.charCodeAt(1) + stock.symbol.length;
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      const baseScore = seededRandom(seed) * 40 - 20; // -20 to +20
      const sentimentScore = Math.round(baseScore + multiplier.sentiment * 100);
      
      return {
        overallSentiment: sentimentScore > 5 ? 'bullish' : sentimentScore < -5 ? 'bearish' : 'neutral',
        sentimentScore,
        priceTarget: Math.round(seededRandom(seed + 1) * 20 + 10), // 10-30% target
        keyFactors: [
          `Strong ${stock.sector.toLowerCase()} sector fundamentals`,
          `Positive quarterly earnings outlook for ${stock.symbol}`,
          `Institutional investor confidence in ${stock.name}`,
          `Technical indicators showing bullish momentum`
        ],
        riskFactors: [
          `Market volatility affecting ${stock.sector} sector`,
          `Regulatory changes impacting ${stock.symbol}`,
          `Global economic headwinds`,
          `Competition in ${stock.sector.toLowerCase()} space`
        ],
        opportunities: [
          `${stock.sector} sector growth potential`,
          `Digital transformation initiatives at ${stock.symbol}`,
          `Expansion into new markets`,
          `Strategic partnerships and acquisitions`
        ]
      };
    };

    return generateMockData(selectedStock);
  }, [selectedStock]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-emerald-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">
              {selectedStock ? `${selectedStock.symbol} Impact Analysis` : 'Market Impact Analysis'}
            </h2>
            <p className="text-sm text-slate-400">
              {selectedStock 
                ? `AI-powered analysis for ${selectedStock.name}`
                : 'AI-powered market sentiment analysis'
              }
            </p>
          </div>
        </div>
      </div>

      {!selectedStock ? (
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">Select a stock to view detailed analysis</p>
          <p className="text-xs text-slate-500">Use the search above to choose any Nifty 50 stock</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={getSentimentColor(analysisData.overallSentiment)}>
                  {getSentimentIcon(analysisData.overallSentiment)}
                </div>
                <h3 className="font-semibold text-white">Overall Sentiment</h3>
              </div>
              <p className={`text-lg font-bold capitalize ${getSentimentColor(analysisData.overallSentiment)}`}>
                {analysisData.overallSentiment}
              </p>
              <p className="text-sm text-slate-400">Score: {analysisData.sentimentScore}</p>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-white">Price Target</h3>
              </div>
              <p className="text-lg font-bold text-green-400">+{analysisData.priceTarget}%</p>
              <p className="text-sm text-slate-400">12-month outlook</p>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Sector</h3>
              </div>
              <p className="text-lg font-bold text-blue-400">{selectedStock.sector}</p>
              <p className="text-sm text-slate-400">Industry classification</p>
            </div>
          </div>

          {/* Key Factors */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-300 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Growth Drivers</span>
              </h3>
              <ul className="space-y-2">
                {analysisData.keyFactors.slice(0, 4).map((factor, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="font-semibold text-red-300 mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Risk Factors</span>
              </h3>
              <ul className="space-y-2">
                {analysisData.riskFactors.slice(0, 4).map((risk, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="font-semibold text-blue-300 mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Opportunities</span>
              </h3>
              <ul className="space-y-2">
                {analysisData.opportunities.slice(0, 4).map((opportunity, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
