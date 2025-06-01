
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
    reasoning: "Major capital allocation towards future energy transition. Expected to boost Reliance's weight in Nifty 50 and attract ESG-focused investments.",
    confidence: 85
  },
  {
    news: "RBI maintains repo rate at 6.5%, signals hawkish stance",
    company: "Banking Sector",
    impact: "medium",
    direction: "bearish",
    pointsImpact: -25,
    reasoning: "Higher rates increase borrowing costs for businesses. Banking stocks may see mixed impact - higher NIMs but potential increase in NPAs.",
    confidence: 75
  },
  {
    news: "TCS reports strong Q3 earnings, beats estimates",
    company: "Tata Consultancy Services",
    impact: "medium",
    direction: "bullish",
    pointsImpact: +30,
    reasoning: "Strong IT sector performance indicates robust global demand. TCS being a major Nifty component typically lifts the entire IT sector.",
    confidence: 80
  }
];

const ImpactAnalysis = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">Impact Analysis</h2>
          <p className="text-sm text-slate-400">AI-powered market assessment</p>
        </div>
      </div>

      <div className="space-y-4">
        {impactData.map((item, index) => (
          <div key={index} className="border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-semibold text-white mb-1 leading-tight">{item.news}</h3>
                <p className="text-xs text-slate-400">{item.company}</p>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  item.direction === 'bullish' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {item.direction === 'bullish' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="font-medium">
                    {item.pointsImpact > 0 ? '+' : ''}{item.pointsImpact} pts
                  </span>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  item.impact === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                  item.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {item.impact.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">AI Analysis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span className="text-xs text-slate-400">{item.confidence}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{item.reasoning}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Market Summary</span>
        </div>
        <p className="text-sm text-slate-300">
          Combined impact suggests a net positive movement of +50 points driven primarily by Reliance's renewable energy announcement. 
          Monitor RBI policy impact on rate-sensitive sectors.
        </p>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
