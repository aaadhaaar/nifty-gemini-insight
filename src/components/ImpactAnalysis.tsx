import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useImpactAnalysis } from '@/hooks/useImpactAnalysis';
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
import ImpactAggressiveHeader from './impact/ImpactAggressiveHeader';
import { useAggressiveMarketFetch } from './impact/useAggressiveMarketFetch';
import EmptyMarketIntelligence from './impact/EmptyMarketIntelligence';

const ImpactAnalysis = () => {
  const { data: impactData, isLoading, error, refetch } = useImpactAnalysis();

  useAggressiveMarketFetch(impactData, isLoading, refetch);

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
      <ImpactAggressiveHeader isUsingFallback={isUsingFallback} />

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
          <EmptyMarketIntelligence />
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
