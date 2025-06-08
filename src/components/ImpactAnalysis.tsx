
import React, { useMemo } from 'react';
import { Target, Zap, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import ImpactChart from './ImpactChart';
import LoadingSpinner from './LoadingSpinner';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error } = useImpactAnalysis();

  const chartData = useMemo(() => {
    if (!impactData || impactData.length === 0) return [];

    let cumulativeImpact = 0;
    const timeData: { [key: string]: { impact: number; count: number } } = {};

    // Group by hour for better visualization
    impactData.forEach((item) => {
      const hour = new Date(item.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (!timeData[hour]) {
        timeData[hour] = { impact: 0, count: 0 };
      }
      
      timeData[hour].impact += item.expected_points_impact || 0;
      timeData[hour].count += 1;
    });

    return Object.entries(timeData)
      .map(([time, data]) => {
        cumulativeImpact += data.impact;
        return {
          time,
          cumulativeImpact,
          articleCount: data.count
        };
      })
      .slice(-12); // Show last 12 data points
  }, [impactData]);

  const totalImpact = useMemo(() => {
    if (!impactData) return 0;
    return impactData.reduce((sum, item) => sum + (item.expected_points_impact || 0), 0);
  }, [impactData]);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="text-center py-8 text-red-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>Error loading impact analysis</p>
        </div>
      </div>
    );
  }

  if (!impactData || impactData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Impact Analysis</h2>
            <p className="text-sm text-slate-400">AI-powered market assessment</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-400">
          <Activity className="w-8 h-8 mx-auto mb-2" />
          <p>No impact analysis data available yet</p>
          <p className="text-sm mt-1">Analysis will appear as news articles are processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white">Impact Analysis</h2>
          <p className="text-sm text-slate-400">AI-powered market assessment</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {/* Realtime Chart */}
      <div className="mb-6">
        <ImpactChart data={chartData} />
      </div>

      {/* Impact Cards */}
      <div className="space-y-4">
        {impactData.slice(0, 5).map((item) => (
          <div key={item.id} className="border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-semibold text-white mb-1 leading-tight">
                  {item.news_article?.title || 'News Article'}
                </h3>
                <p className="text-xs text-slate-400">{item.news_article?.source || 'Unknown Source'}</p>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  (item.expected_points_impact || 0) >= 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {(item.expected_points_impact || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="font-medium">
                    {(item.expected_points_impact || 0) > 0 ? '+' : ''}{item.expected_points_impact || 0} pts
                  </span>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  (item.confidence_score || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  (item.confidence_score || 0) >= 60 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {item.confidence_score || 0}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">What Happened</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{item.what_happened}</p>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Why It Matters</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{item.why_matters}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Summary */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Market Summary</span>
        </div>
        <p className="text-sm text-slate-300">
          Current analysis shows a net {totalImpact >= 0 ? 'positive' : 'negative'} impact of {totalImpact > 0 ? '+' : ''}{totalImpact} points 
          based on {impactData.length} analyzed {impactData.length === 1 ? 'article' : 'articles'}. 
          {impactData.length > 0 && ` Latest update: ${new Date(impactData[0].created_at).toLocaleTimeString()}`}
        </p>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
