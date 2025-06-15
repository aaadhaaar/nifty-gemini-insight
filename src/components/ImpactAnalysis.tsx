
import React, { useMemo } from 'react';
import { Brain, AlertTriangle } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import LoadingSpinner from './LoadingSpinner';
import MarketSummaryCards from './impact/MarketSummaryCards';
import CriticalAlerts from './impact/CriticalAlerts';
import IntelligenceReport from './impact/IntelligenceReport';
import CompetitiveIntelligenceSummary from './impact/CompetitiveIntelligenceSummary';

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

  // Sample intelligence data for when no real events are available
  const fallbackIntelligence = [
    {
      id: 'sample-1',
      news_article_id: null,
      what_happened: 'Elite Market Intelligence System Online',
      why_matters: 'Advanced AI monitoring systems are actively scanning global markets for emerging opportunities and threats',
      market_impact_description: 'Continuous competitive analysis framework deployed across all major market segments with real-time threat detection',
      expected_points_impact: 0.5,
      confidence_score: 95,
      created_at: new Date().toISOString()
    },
    {
      id: 'sample-2',
      news_article_id: null,
      what_happened: 'Strategic Positioning Analysis Active',
      why_matters: 'Market structure algorithms identifying institutional flow patterns and sentiment shifts across key sectors',
      market_impact_description: 'Technical confluence zones mapped with high-probability reversal and breakout opportunities under surveillance',
      expected_points_impact: -0.2,
      confidence_score: 88,
      created_at: new Date().toISOString()
    },
    {
      id: 'sample-3',
      news_article_id: null,
      what_happened: 'Global Market Intelligence Network Synchronized',
      why_matters: 'Cross-market correlation analysis detecting early warning signals from international indices and commodity flows',
      market_impact_description: 'FII/DII positioning data integrated with options flow analysis to predict next major directional move',
      expected_points_impact: 0.8,
      confidence_score: 91,
      created_at: new Date().toISOString()
    }
  ];

  const displayData = impactData && impactData.length > 0 ? impactData : fallbackIntelligence;

  const marketSummary = useMemo(() => {
    if (!displayData || displayData.length === 0) return null;

    const totalImpact = displayData.reduce((sum, item) => sum + (item.expected_points_impact || 0), 0);
    const strongPositive = displayData.filter(item => (item.expected_points_impact || 0) > 1);
    const strongNegative = displayData.filter(item => (item.expected_points_impact || 0) < -1);
    const criticalEvents = displayData.filter(item => Math.abs(item.expected_points_impact || 0) >= 2);
    const avgConfidence = displayData.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / displayData.length;

    return {
      totalImpact,
      totalImpactStrength: getImpactStrength(totalImpact),
      totalImpactDirection: getImpactDirection(totalImpact),
      strongPositive: strongPositive.length,
      strongNegative: strongNegative.length,
      criticalEvents: criticalEvents.length,
      avgConfidence: Math.round(avgConfidence),
      latestUpdate: displayData[0]?.created_at,
      marketMomentum: totalImpact > 1 ? 'Strong Bullish' : totalImpact < -1 ? 'Strong Bearish' : 'Consolidation'
    };
  }, [displayData]);

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

  const isUsingFallback = !impactData || impactData.length === 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white">Competitive Intelligence Dashboard</h2>
          <p className="text-sm text-slate-400">
            {isUsingFallback ? 'Demo mode • AI systems primed for market events' : 'Elite market analysis • Real-time strategic insights'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isUsingFallback ? 'bg-blue-400' : 'bg-green-400'} animate-pulse`}></div>
          <span className="text-xs text-slate-400">{isUsingFallback ? 'Standby' : 'Active'}</span>
        </div>
      </div>

      {isUsingFallback && (
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            🚀 <strong>Demo Intelligence:</strong> Displaying sample analysis capabilities. Live market events will appear here when detected.
          </p>
        </div>
      )}

      {marketSummary && (
        <>
          <MarketSummaryCards
            marketSummary={marketSummary}
            getImpactColor={getImpactColor}
            getImpactBgColor={getImpactBgColor}
          />
          
          <CriticalAlerts marketSummary={marketSummary} />
        </>
      )}

      <div className="space-y-4">
        {displayData.slice(0, 6).map((item, index) => (
          <IntelligenceReport
            key={item.id}
            item={item}
            index={index}
            getImpactStrength={getImpactStrength}
            getImpactDirection={getImpactDirection}
            getImpactColor={getImpactColor}
            getImpactBgColor={getImpactBgColor}
          />
        ))}
      </div>

      {marketSummary && (
        <CompetitiveIntelligenceSummary
          marketSummary={marketSummary}
          getImpactColor={getImpactColor}
        />
      )}
    </div>
  );
};

export default ImpactAnalysis;
