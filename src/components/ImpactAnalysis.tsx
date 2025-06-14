
import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, Activity } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import LoadingSpinner from './LoadingSpinner';
import ImpactChart from './ImpactChart';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface ImpactAnalysisProps {
  selectedStock?: Stock;
}

const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ selectedStock }) => {
  const { data: analysisData, isLoading, error } = useImpactAnalysis();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !analysisData || analysisData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Market Impact Analysis</h2>
            <p className="text-sm text-slate-400">Real-time AI-powered market analysis</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">No market analysis available</p>
          <p className="text-xs text-slate-500">Market analysis data is being generated</p>
        </div>
      </div>
    );
  }

  // Filter analysis for selected stock if available
  const relevantAnalysis = selectedStock 
    ? analysisData.filter(item => 
        item.what_happened.toLowerCase().includes(selectedStock.symbol.toLowerCase()) ||
        item.what_happened.toLowerCase().includes(selectedStock.name.toLowerCase()) ||
        item.what_happened.toLowerCase().includes(selectedStock.sector.toLowerCase())
      )
    : analysisData;

  const displayAnalysis = relevantAnalysis.length > 0 ? relevantAnalysis : analysisData.slice(0, 6);

  // Calculate overall sentiment from analysis data
  const overallImpact = displayAnalysis.reduce((sum, item) => sum + item.expected_points_impact, 0) / displayAnalysis.length;
  const averageConfidence = displayAnalysis.reduce((sum, item) => sum + item.confidence_score, 0) / displayAnalysis.length;

  const getSentimentFromImpact = (impact: number) => {
    if (impact > 0.3) return 'bullish';
    if (impact < -0.3) return 'bearish';
    return 'neutral';
  };

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

  const getImpactStrength = (impact: number) => {
    const abs = Math.abs(impact);
    if (abs >= 1.5) return 'Very Strong';
    if (abs >= 1.0) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    return 'Weak';
  };

  // Prepare chart data
  const chartData = displayAnalysis.slice(-10).map((item, index) => ({
    time: new Date(item.created_at).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    cumulativeImpact: displayAnalysis.slice(0, index + 1).reduce((sum, d) => sum + d.expected_points_impact, 0) / (index + 1),
    articleCount: index + 1
  }));

  const overallSentiment = getSentimentFromImpact(overallImpact);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                {selectedStock ? `${selectedStock.symbol} Market Analysis` : 'Live Market Analysis'}
              </h2>
              <p className="text-sm text-slate-400">
                {selectedStock 
                  ? `Real-time analysis for ${selectedStock.name}`
                  : 'AI-powered market event analysis'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Overall Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={getSentimentColor(overallSentiment)}>
                {getSentimentIcon(overallSentiment)}
              </div>
              <h3 className="font-semibold text-white">Market Sentiment</h3>
            </div>
            <p className={`text-lg font-bold capitalize ${getSentimentColor(overallSentiment)}`}>
              {overallSentiment}
            </p>
            <p className="text-sm text-slate-400">
              Impact: {overallImpact > 0 ? '+' : ''}{overallImpact.toFixed(2)} points
            </p>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Analysis Strength</h3>
            </div>
            <p className="text-lg font-bold text-blue-400">
              {getImpactStrength(overallImpact)}
            </p>
            <p className="text-sm text-slate-400">
              Confidence: {averageConfidence.toFixed(0)}%
            </p>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Events Analyzed</h3>
            </div>
            <p className="text-lg font-bold text-purple-400">{displayAnalysis.length}</p>
            <p className="text-sm text-slate-400">
              {selectedStock ? 'Stock-specific' : 'Market-wide'}
            </p>
          </div>
        </div>

        {/* Market Analysis Insights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Brain className="w-5 h-5 text-orange-400" />
            <span>Live Market Insights</span>
          </h3>
          
          <div className="grid gap-4">
            {displayAnalysis.slice(0, 4).map((analysis, index) => (
              <div key={analysis.id} className={`p-4 rounded-xl border ${
                analysis.expected_points_impact > 0.5 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : analysis.expected_points_impact < -0.5
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      analysis.expected_points_impact > 0.5 ? 'bg-emerald-400' : 
                      analysis.expected_points_impact < -0.5 ? 'bg-red-400' : 'bg-blue-400'
                    }`}></div>
                    <span className={`text-xs font-medium ${
                      analysis.expected_points_impact > 0.5 ? 'text-emerald-300' : 
                      analysis.expected_points_impact < -0.5 ? 'text-red-300' : 'text-blue-300'
                    }`}>
                      {analysis.expected_points_impact > 0 ? 'POSITIVE' : analysis.expected_points_impact < 0 ? 'NEGATIVE' : 'NEUTRAL'} IMPACT
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{analysis.confidence_score}% confidence</span>
                    <span>•</span>
                    <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-white mb-2 text-sm">
                  {analysis.what_happened}
                </h4>
                
                <p className="text-sm text-slate-300 mb-3">
                  {analysis.why_matters}
                </p>
                
                <div className="pt-2 border-t border-slate-600/30">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium">Market Impact:</span> {analysis.market_impact_description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Trend Chart */}
      {chartData.length > 0 && (
        <ImpactChart data={chartData} />
      )}
    </div>
  );
};

export default ImpactAnalysis;
