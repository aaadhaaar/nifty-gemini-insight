
import React from 'react';
import { Target, Zap, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface ImpactData {
  news: string;
  company: string;
  impact: 'high' | 'medium' | 'low';
  direction: 'bullish' | 'bearish';
  pointsImpact: number;
  reasoning: string;
  confidence: number;
}

const impactData: ImpactData[] = [
  {
    news: "Reliance announces ₹75,000 crore renewable energy investment",
    company: "Reliance Industries",
    impact: "high",
    direction: "bullish",
    pointsImpact: +45,
    reasoning: "Major capital allocation towards future energy transition. Expected to boost Reliance's weight in Nifty 50 and attract ESG-focused investments, creating positive momentum across energy and infrastructure sectors.",
    confidence: 85
  },
  {
    news: "RBI maintains repo rate at 6.5%, signals hawkish stance",
    company: "Banking Sector",
    impact: "medium",
    direction: "bearish",
    pointsImpact: -25,
    reasoning: "Higher rates increase borrowing costs for businesses and consumers. Banking stocks may see mixed impact - higher NIMs but potential increase in NPAs. Overall negative for growth-sensitive sectors.",
    confidence: 75
  },
  {
    news: "TCS reports strong Q3 earnings, beats estimates",
    company: "Tata Consultancy Services",
    impact: "medium",
    direction: "bullish",
    pointsImpact: +30,
    reasoning: "Strong IT sector performance indicates robust global demand for tech services. TCS being a major Nifty component, its outperformance typically lifts the entire IT sector and provides positive sentiment to the index.",
    confidence: 80
  }
];

const ImpactAnalysis = () => {
  return (
    <div className="glass-effect rounded-2xl p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Impact Analysis</h2>
          <p className="text-gray-400">AI-powered market impact assessment</p>
        </div>
      </div>

      <div className="space-y-6">
        {impactData.map((item, index) => (
          <div key={index} className="border border-white/10 rounded-xl p-6 hover:glow transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{item.news}</h3>
                <p className="text-sm text-gray-400 mb-3">{item.company}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  item.direction === 'bullish' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {item.direction === 'bullish' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {item.pointsImpact > 0 ? '+' : ''}{item.pointsImpact} pts
                  </span>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.impact === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  item.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {item.impact.toUpperCase()} IMPACT
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">AI Reasoning</span>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-gray-400">{item.confidence}% confidence</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{item.reasoning}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Market Summary</span>
        </div>
        <p className="text-gray-300 text-sm">
          Combined impact suggests a net positive movement of +50 points driven primarily by Reliance's renewable energy announcement. 
          Monitor RBI policy impact on rate-sensitive sectors and IT sector momentum from TCS results.
        </p>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
