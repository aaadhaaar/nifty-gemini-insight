
import React, { useEffect } from 'react';
import { Brain, AlertTriangle, RefreshCw } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from './LoadingSpinner';
import MarketSummaryCards from './impact/MarketSummaryCards';
import CriticalAlerts from './impact/CriticalAlerts';
import IntelligenceReport from './impact/IntelligenceReport';
import CompetitiveIntelligenceSummary from './impact/CompetitiveIntelligenceSummary';
import { isTechnicalAnalysis } from '@/utils/isTechnicalAnalysis';
import { fallbackIntelligence } from './impact/ImpactUtils';
import { sortByPriorityAndImpact } from './impact/PrioritySorter';
import { getImpactStrength, getImpactDirection, getImpactColor, getImpactBgColor } from './impact/impactHelpers';
import { useMarketSummary } from './impact/useMarketSummary';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error, refetch } = useImpactAnalysis();

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
            setTimeout(() => refetch(), 2000);
          }
        } catch (error) {
          console.error('Error in forced fetch-news function:', error);
        }
      }
    };

    if (!isLoading) {
      triggerMarketDataFetch();
    }
  }, [impactData, isLoading, refetch]);

  // Filtering and sorting
  const displayData = React.useMemo(() => {
    const rawData = impactData && impactData.length > 0 ? impactData : fallbackIntelligence;
    const eventDrivenData = rawData.filter(item => !isTechnicalAnalysis(item));
    return sortByPriorityAndImpact(eventDrivenData);
  }, [impactData]);

  const marketSummary = useMarketSummary(displayData);

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
