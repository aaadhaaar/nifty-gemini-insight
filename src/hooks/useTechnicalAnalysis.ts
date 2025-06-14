
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

      // Fetch fresh data from the edge function
      console.log('Fetching technical analysis from edge function...');
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
