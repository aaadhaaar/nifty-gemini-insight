
import React, { useMemo } from 'react';
import { Target, Zap, AlertTriangle, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Brain, Flame, Shield } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import LoadingSpinner from './LoadingSpinner';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error } = useImpactAnalysis();

  // Enhanced impact analysis with competitive intelligence
  const getImpactStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 2.5) return 'Extreme';
    if (absValue >= 2.0) return 'Very Strong';
    if (absValue >= 1.5) return 'Strong';
    if (absValue >= 1.0) return 'Moderate';
    if (absValue >= 0.5) return 'Weak';
    return 'Minimal';
  };

  const getImpactDirection = (value: number): string => {
    if (value > 0.5) return 'Bullish';
    if (value < -0.5) return 'Bearish';
    return 'Neutral';
  };

  const getImpactColor = (value: number): string => {
    if (value > 1.5) return 'text-green-400';
    if (value > 0.5) return 'text-emerald-400';
    if (value < -1.5) return 'text-red-400';
    if (value < -0.5) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getImpactBgColor = (value: number): string => {
    if (value > 1.5) return 'bg-green-500/20 border-green-500/30';
    if (value > 0.5) return 'bg-emerald-500/20 border-emerald-500/30';
    if (value < -1.5) return 'bg-red-500/20 border-red-500/30';
    if (value < -0.5) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-yellow-500/20 border-yellow-500/30';
  };

  const getUrgencyIcon = (impact: number) => {
    const absImpact = Math.abs(impact);
    if (absImpact >= 2) return <Flame className="w-4 h-4 text-red-400 animate-pulse" />;
    if (absImpact >= 1) return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    return <Activity className="w-4 h-4 text-blue-400" />;
  };

  const marketSummary = useMemo(() => {
    if (!impactData || impactData.length === 0) return null;

    const totalImpact = impactData.reduce((sum, item) => sum + (item.expected_points_impact || 0), 0);
    const strongPositive = impactData.filter(item => (item.expected_points_impact || 0) > 1);
    const strongNegative = impactData.filter(item => (item.expected_points_impact || 0) < -1);
    const criticalEvents = impactData.filter(item => Math.abs(item.expected_points_impact || 0) >= 2);
    const avgConfidence = impactData.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / impactData.length;

    return {
      totalImpact,
      totalImpactStrength: getImpactStrength(totalImpact),
      totalImpactDirection: getImpactDirection(totalImpact),
      strongPositive: strongPositive.length,
      strongNegative: strongNegative.length,
      criticalEvents: criticalEvents.length,
      avgConfidence: Math.round(avgConfidence),
      latestUpdate: impactData[0]?.created_at,
      marketMomentum: totalImpact > 1 ? 'Strong Bullish' : totalImpact < -1 ? 'Strong Bearish' : 'Consolidation'
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
          <p>Error loading competitive intelligence</p>
        </div>
      </div>
    );
  }

  if (!impactData || impactData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Competitive Intelligence</h2>
            <p className="text-sm text-slate-400">Elite market analysis engine</p>
          </div>
        </div>
        <div className="text-center py-8 text-slate-400">
          <Brain className="w-8 h-8 mx-auto mb-2" />
          <p>Intelligence gathering in progress...</p>
          <p className="text-sm mt-1">Advanced analysis will appear as market events are processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white">Competitive Intelligence Dashboard</h2>
          <p className="text-sm text-slate-400">Elite market analysis • Real-time strategic insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Active</span>
        </div>
      </div>

      {/* Enhanced Market Overview Cards */}
      {marketSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`rounded-xl p-3 border ${getImpactBgColor(marketSummary.totalImpact)}`}>
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">Net Signal</span>
            </div>
            <div className={`text-lg font-bold ${getImpactColor(marketSummary.totalImpact)}`}>
              {marketSummary.totalImpactStrength}
            </div>
            <div className="text-xs text-slate-400">{marketSummary.totalImpactDirection}</div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300">Bullish</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">{marketSummary.strongPositive}</div>
            <div className="text-xs text-slate-400">Signals</div>
          </div>

          <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">Bearish</span>
            </div>
            <div className="text-lg font-bold text-red-400">{marketSummary.strongNegative}</div>
            <div className="text-xs text-slate-400">Signals</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300">Confidence</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{marketSummary.avgConfidence}%</div>
            <div className="text-xs text-slate-400">Average</div>
          </div>
        </div>
      )}

      {/* Critical Alerts Section */}
      {marketSummary && marketSummary.criticalEvents > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-sm font-medium text-red-300">CRITICAL MARKET ALERTS</span>
          </div>
          <p className="text-sm text-slate-300">
            {marketSummary.criticalEvents} high-impact event{marketSummary.criticalEvents > 1 ? 's' : ''} detected. 
            Immediate market response expected. Current momentum: <span className="font-bold text-white">{marketSummary.marketMomentum}</span>
          </p>
        </div>
      )}

      {/* Enhanced Intelligence Analysis */}
      <div className="space-y-4">
        {impactData.slice(0, 6).map((item, index) => {
          const impactStrength = getImpactStrength(item.expected_points_impact || 0);
          const impactDirection = getImpactDirection(item.expected_points_impact || 0);
          const impactColor = getImpactColor(item.expected_points_impact || 0);
          const impactBgColor = getImpactBgColor(item.expected_points_impact || 0);
          const isHighImpact = Math.abs(item.expected_points_impact || 0) >= 1.5;
          
          return (
            <div key={item.id} className={`border rounded-xl p-4 transition-all duration-300 ${
              isHighImpact ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-red-500/5 hover:bg-orange-500/10' : 
              'border-slate-700/50 hover:bg-slate-700/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getUrgencyIcon(item.expected_points_impact || 0)}
                    <span className="text-xs text-slate-400">Intelligence Report #{index + 1}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                    {isHighImpact && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium animate-pulse">
                        HIGH IMPACT
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs border ${impactBgColor}`}>
                    {(item.expected_points_impact || 0) >= 0.5 ? <TrendingUp className="w-3 h-3" /> : 
                     (item.expected_points_impact || 0) <= -0.5 ? <TrendingDown className="w-3 h-3" /> : 
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
                    (item.confidence_score || 0) >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    (item.confidence_score || 0) >= 80 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
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
                    <span className="text-xs font-medium text-blue-300">Intelligence Summary</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.what_happened}</p>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-medium text-purple-300">Strategic Impact</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.why_matters}</p>
                </div>

                {item.market_impact_description && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-medium text-orange-300">Competitive Analysis</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.market_impact_description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Market Summary */}
      {marketSummary && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Competitive Intelligence Summary</span>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            Elite analysis reveals <span className={`font-medium ${getImpactColor(marketSummary.totalImpact)}`}>
              {marketSummary.totalImpactStrength.toLowerCase()} {marketSummary.totalImpactDirection.toLowerCase()}
            </span> market sentiment. Intelligence includes {marketSummary.strongPositive} bullish and {marketSummary.strongNegative} bearish 
            signals with {marketSummary.avgConfidence}% average confidence. 
            {marketSummary.criticalEvents > 0 && (
              <span className="text-red-400 font-medium"> {marketSummary.criticalEvents} critical alert{marketSummary.criticalEvents > 1 ? 's' : ''} active.</span>
            )}
          </p>
          {marketSummary.latestUpdate && (
            <div className="text-xs text-slate-400">
              Last intelligence update: {new Date(marketSummary.latestUpdate).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
