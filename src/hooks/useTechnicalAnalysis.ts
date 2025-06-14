
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useTechnicalAnalysis = () => {
  const [data, setData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async (forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      
      if (!forceRefresh) {
        // Check for cached data first
        const { data: cachedData } = await supabase
          .from('technical_analysis')
          .select('*')
          .eq('analysis_date', today)
          .order('created_at', { ascending: false })
          .limit(1);

        if (cachedData && cachedData.length > 0) {
          const analysis = cachedData[0];
          setData({
            market_overview: analysis.market_overview,
            technical_indicators: analysis.technical_indicators,
            key_levels: analysis.key_levels,
            chart_patterns: analysis.chart_patterns,
          });
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const { data: functionData, error: functionError } = await supabase.functions.invoke('technical-analysis');

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (functionData && functionData.success) {
        setData(functionData.data);
      } else {
        throw new Error('Failed to fetch technical analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return { data, loading, error, refetch: () => fetchAnalysis(true) };
};
