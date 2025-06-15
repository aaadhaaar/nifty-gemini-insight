
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
      console.log('Triggering market intelligence fetch...')
      
      // First, trigger the fetch-news edge function to get fresh market events
      try {
        const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-news', {
          body: { 
            searchIntensity: 'standard',
            timeContext: new Date().getHours(),
            forceRefresh: false
          }
        });

        if (fetchError) {
          console.error('Error calling fetch-news function:', fetchError);
        } else {
          console.log('Market intelligence fetch result:', fetchResult);
        }
      } catch (error) {
        console.error('Error invoking fetch-news function:', error);
      }

      // Wait a moment for the edge function to process and store the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now fetch the latest news articles from the database
      console.log('Fetching news articles from database...')
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} news articles`)
      return data as NewsArticle[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 3,
    retryDelay: 1000,
  });
};
