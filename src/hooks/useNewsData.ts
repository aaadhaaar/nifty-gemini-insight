
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  url: string | null;
  image_url: string | null;
  published_at: string | null;
  source: string | null;
  category: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  market_impact: 'high' | 'medium' | 'low' | null;
  companies: string[] | null;
  created_at: string;
}

export const useNewsData = () => {
  return useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      console.log('Triggering enhanced market intelligence fetch...')
      
      // Trigger the enhanced fetch-news edge function
      try {
        const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-news', {
          body: { 
            searchIntensity: 'standard',
            timeContext: new Date().getHours(),
            forceRefresh: false
          }
        });

        if (fetchError) {
          console.error('Error calling enhanced fetch-news function:', fetchError);
        } else {
          console.log('Enhanced market intelligence result:', fetchResult);
        }
      } catch (error) {
        console.error('Error invoking enhanced fetch-news function:', error);
      }

      // Wait for the edge function to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch the latest news articles from database
      console.log('Fetching enhanced news articles from database...')
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching enhanced news:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} enhanced news articles`)
      return data as NewsArticle[];
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2,
    retryDelay: 2000,
  });
};
