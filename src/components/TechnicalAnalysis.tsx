import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import MarketOverview from './technical/MarketOverview';
import TechnicalIndicators from './technical/TechnicalIndicators';
import KeyLevels from './technical/KeyLevels';
import ChartPatterns from './technical/ChartPatterns';

interface TechnicalData {
  market_overview: {
    nifty_level: number;
    resistance: number;
    support: number;
    overall_trend: string;
  };
  technical_indicators: Array<{
    name: string;
    value: string;
    signal: string;
    description: string;
  }>;
  key_levels: Array<{
    level: number;
    type: string;
    strength: string;
  }>;
  chart_patterns: Array<{
    name: string;
    timeframe: string;
    probability: number;
    target: number;
  }>;
}

const TechnicalAnalysis = () => {
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTechnicalAnalysis = async (forceRefresh = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // First check if we have recent data in the database
      const today = new Date().toISOString().split('T')[0];
      const { data: existingData } = await supabase
        .from('technical_analysis')
        .select('*')
        .eq('analysis_date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      // If we have data from today and not forcing refresh, use it
      if (existingData && existingData.length > 0 && !forceRefresh) {
        const analysis = existingData[0];
        setTechnicalData({
          market_overview: analysis.market_overview,
          technical_indicators: analysis.technical_indicators,
          key_levels: analysis.key_levels,
          chart_patterns: analysis.chart_patterns,
        });
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Otherwise, fetch fresh data from the API
      console.log('Fetching fresh technical analysis...');
      const { data, error: functionError } = await supabase.functions.invoke('technical-analysis');

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data && data.success) {
        setTechnicalData(data.data);
      } else {
        throw new Error('Failed to fetch technical analysis');
      }
    } catch (err) {
      console.error('Error fetching technical analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to load technical analysis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTechnicalAnalysis();
  }, []);

  const handleRefresh = () => {
    fetchTechnicalAnalysis(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-white">Loading technical analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div className="text-center">
              <p className="text-white font-medium mb-2">Technical Analysis Unavailable</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!technicalData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live Technical Analysis</h2>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
        >
          {refreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <MarketOverview
        niftyLevel={technicalData.market_overview.nifty_level}
        resistance={technicalData.market_overview.resistance}
        support={technicalData.market_overview.support}
        overallTrend={technicalData.market_overview.overall_trend}
      />
      
      <TechnicalIndicators indicators={technicalData.technical_indicators} />
      
      <KeyLevels levels={technicalData.key_levels} />
      
      <ChartPatterns patterns={technicalData.chart_patterns} />
      
      <div className="text-center text-xs text-slate-500">
        Last updated: {new Date().toLocaleTimeString()} • Powered by AI analysis
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
