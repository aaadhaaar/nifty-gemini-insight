import React, { useMemo, useEffect } from 'react';
import { Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { useImpactAnalysis, ImpactAnalysisData } from '@/hooks/useImpactAnalysis';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from './LoadingSpinner';
import MarketSummaryCards from './impact/MarketSummaryCards';
import CriticalAlerts from './impact/CriticalAlerts';
import IntelligenceReport from './impact/IntelligenceReport';
import CompetitiveIntelligenceSummary from './impact/CompetitiveIntelligenceSummary';
import { isTechnicalAnalysis } from '@/utils/isTechnicalAnalysis';
import { fallbackIntelligence } from './impact/ImpactUtils';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error, refetch } = useImpactAnalysis();

  // Trigger API call when no events are detected
  useEffect(() => {
    const triggerMarketDataFetch = async () => {
      if (!isLoading && (!impactData || impactData.length === 0)) {
        console.log('No market events detected - triggering aggressive data fetch');
        
        try {
          const { data, error } = await supabase.functions.invoke('fetch-news', {
            body: { 
              searchIntensity: 'high',
              timeContext: new Date().getHours(),
              forceRefresh: true
            }
          });
          
          if (error) {
            console.error('Error forcing market data fetch:', error);
          } else {
            console.log('Forced market data fetch result:', data);
            // Refetch the impact analysis data after forcing new data
            setTimeout(() => refetch(), 2000);
          }
        } catch (error) {
          console.error('Error in forced fetch-news function:', error);
        }
      }
    };

    // Only trigger if we've loaded and have no data
    if (!isLoading) {
      triggerMarketDataFetch();
    }
  }, [impactData, isLoading, refetch]);

  // Enhanced priority-based sorting function
  const sortByPriorityAndImpact = (data: any[]) => {
    return [...data].sort((a, b) => {
      const impactA = Math.abs(a.expected_points_impact || 0);
      const impactB = Math.abs(b.expected_points_impact || 0);
      const confidenceA = a.confidence_score || 0;
      const confidenceB = b.confidence_score || 0;
      
      // Calculate priority scores
      const getPriorityScore = (impact: number, confidence: number) => {
        let score = impact * 10; // Base impact weight
        
        // Confidence multiplier
        if (confidence >= 90) score *= 1.5;
        else if (confidence >= 80) score *= 1.2;
        else if (confidence >= 70) score *= 1.0;
        else score *= 0.8;
        
        // Critical threshold boost
        if (impact >= 2) score += 50;
        else if (impact >= 1.5) score += 30;
        else if (impact >= 1) score += 15;
        
        // Recency boost (newer events get slight priority)
        const hoursOld = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursOld < 1) score += 5;
        else if (hoursOld < 6) score += 2;
        
        return score;
      };
      
      const scoreA = getPriorityScore(impactA, confidenceA);
      const scoreB = getPriorityScore(impactB, confidenceB);
      
      return scoreB - scoreA; // Descending order (highest priority first)
    });
  };

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

  // Apply filtering of technical reports and then priority sorting
  const displayData = React.useMemo(() => {
    const rawData = impactData && impactData.length > 0 ? impactData : fallbackIntelligence;
    // FILTER: Remove all items that match technical analysis
    const eventDrivenData = rawData.filter(item => !isTechnicalAnalysis(item));
    return sortByPriorityAndImpact(eventDrivenData);
  }, [impactData]);

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
            {isUsingFallback ? 'Enhanced fallback mode • Fetching live market data...' : 'Elite market analysis • Real-time strategic insights'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isUsingFallback ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-xs text-slate-400">{isUsingFallback ? 'Acquiring' : 'Active'}</span>
          {isUsingFallback && <RefreshCw className="w-3 h-3 text-orange-400 animate-spin" />}
        </div>
      </div>

      {isUsingFallback && (
        <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-300">
            🔥 <strong>AGGRESSIVE MODE:</strong> No live events detected - triggering high-intensity market scan. Enhanced intelligence displayed while acquiring fresh data.
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
        {displayData.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p>No event-driven market intelligence available at this time.</p>
            <p className="text-xs mt-1">All technical analysis and pattern-based signals are now hidden.</p>
          </div>
        ) : (
          displayData.slice(0, 6).map((item, index) => (
            <IntelligenceReport
              key={item.id}
              item={item}
              index={index}
              getImpactStrength={getImpactStrength}
              getImpactDirection={getImpactDirection}
              getImpactColor={getImpactColor}
              getImpactBgColor={getImpactBgColor}
            />
          ))
        )}
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
