
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAggressiveMarketFetch = (
  impactData: any,
  isLoading: boolean,
  refetch: () => void
) => {
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
};
