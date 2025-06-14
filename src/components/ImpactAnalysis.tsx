
import React, { useMemo } from 'react';
import { Target, Zap, AlertTriangle, TrendingUp, TrendingDown, Activity, BarChart3, PieChart } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import ImpactChart from './ImpactChart';
import LoadingSpinner from './LoadingSpinner';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error } = useImpactAnalysis();

  // Convert numeric impact to qualitative indicators
  const getImpactStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'Very Strong';
    if (absValue >= 0.6) return 'Strong';
    if (absValue >= 0.3) return 'Moderate';
    if (absValue >= 0.1) return 'Weak';
    return 'Very Weak';
  };

  const getImpactDirection = (value: number): string => {
    if (value > 0.1) return 'Positive';
    if (value < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getImpactColor = (value: number): string => {
    if (value > 0.1) return 'text-emerald-400';
    if (value < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getImpactBgColor = (value: number): string => {
    if (value > 0.1) return 'bg-emerald-500/20 border-emerald-500/30';
    if (value < -0.1) return 'bg-red-500/20 border-red-500/30';
    return 'bg-yellow-500/20 border-yellow-500/30';
  };

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
      .slice(-12);
  }, [impactData]);

  const marketSummary = useMemo(() => {
    if (!impactData || impactData.length === 0) return null;

    const totalImpact = impactData.reduce((sum, item) => sum + (item.expected_points_impact || 0), 0);
    const positiveEvents = impactData.filter(item => (item.expected_points_impact || 0) > 0.1);
    const negativeEvents = impactData.filter(item => (item.expected_points_impact || 0) < -0.1);
    const avgConfidence = impactData.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / impactData.length;

    return {
      totalImpact,
      totalImpactStrength: getImpactStrength(totalImpact),
      totalImpactDirection: getImpactDirection(totalImpact),
      positiveEvents: positiveEvents.length,
      negativeEvents: negativeEvents.length,
      avgConfidence: Math.round(avgConfidence),
      latestUpdate: impactData[0]?.created_at
    };
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
          <p>No market analysis data available yet</p>
          <p className="text-sm mt-1">Analysis will appear as market events are processed</p>
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
          <h2 className="text-lg md:text-xl font-bold text-white">Market Impact Analysis</h2>
          <p className="text-sm text-slate-400">Comprehensive AI-powered market assessment</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {/* Market Overview Cards */}
      {marketSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`rounded-xl p-3 border ${getImpactBgColor(marketSummary.totalImpact)}`}>
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Net Impact</span>
            </div>
            <div className={`text-lg font-bold ${getImpactColor(marketSummary.totalImpact)}`}>
              {marketSummary.totalImpactStrength}
            </div>
            <div className="text-xs text-slate-400">{marketSummary.totalImpactDirection}</div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">Positive</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">{marketSummary.positiveEvents}</div>
            <div className="text-xs text-slate-400">Events</div>
          </div>

          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">Negative</span>
            </div>
            <div className="text-lg font-bold text-red-400">{marketSummary.negativeEvents}</div>
            <div className="text-xs text-slate-400">Events</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">Confidence</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{marketSummary.avgConfidence}%</div>
            <div className="text-xs text-slate-400">Average</div>
          </div>
        </div>
      )}

      {/* Realtime Chart */}
      <div className="mb-6">
        <ImpactChart data={chartData} />
      </div>

      {/* Market Events Analysis */}
      <div className="space-y-4">
        {impactData.slice(0, 5).map((item) => {
          const impactStrength = getImpactStrength(item.expected_points_impact || 0);
          const impactDirection = getImpactDirection(item.expected_points_impact || 0);
          const impactColor = getImpactColor(item.expected_points_impact || 0);
          const impactBgColor = getImpactBgColor(item.expected_points_impact || 0);
          
          return (
            <div key={item.id} className="border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-slate-400">Market Event Analysis</span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs border ${impactBgColor}`}>
                    {(item.expected_points_impact || 0) >= 0.1 ? <TrendingUp className="w-3 h-3" /> : 
                     (item.expected_points_impact || 0) <= -0.1 ? <TrendingDown className="w-3 h-3" /> : 
                     <Activity className="w-3 h-3" />}
                    <span className={`font-medium ${impactColor}`}>
                      {impactStrength}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className={`font-medium ${impactColor}`}>
                      {impactDirection}
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
                    <span className="text-xs font-medium text-purple-300">Market Impact</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.why_matters}</p>
                </div>

                {item.market_impact_description && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-medium text-orange-300">Detailed Analysis</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.market_impact_description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Market Summary */}
      {marketSummary && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Market Overview</span>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            Current market analysis shows a <span className={`font-medium ${getImpactColor(marketSummary.totalImpact)}`}>
              {marketSummary.totalImpactStrength.toLowerCase()} {marketSummary.totalImpactDirection.toLowerCase()}
            </span> sentiment. Analysis includes {marketSummary.positiveEvents} positive and {marketSummary.negativeEvents} negative 
            market events with {marketSummary.avgConfidence}% average confidence.
          </p>
          {marketSummary.latestUpdate && (
            <div className="text-xs text-slate-400">
              Last updated: {new Date(marketSummary.latestUpdate).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
