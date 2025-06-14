
import React from 'react';
import { Target, Brain } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import LoadingSpinner from './LoadingSpinner';
import ImpactChart from './ImpactChart';
import ImpactMetricsCard from './ImpactMetricsCard';
import AnalysisInsights from './AnalysisInsights';

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

  // Prepare chart data
  const chartData = displayAnalysis.slice(-10).map((item, index) => ({
    time: new Date(item.created_at).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    cumulativeImpact: displayAnalysis.slice(0, index + 1).reduce((sum, d) => sum + d.expected_points_impact, 0) / (index + 1),
    articleCount: index + 1
  }));

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

        <ImpactMetricsCard
          overallImpact={overallImpact}
          averageConfidence={averageConfidence}
          analysisCount={displayAnalysis.length}
          selectedStock={selectedStock}
        />

        <AnalysisInsights analysisData={displayAnalysis} />
      </div>

      {/* Impact Trend Chart */}
      {chartData.length > 0 && (
        <ImpactChart data={chartData} />
      )}
    </div>
  );
};

export default ImpactAnalysis;
