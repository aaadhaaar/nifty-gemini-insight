
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
    refetchInterval: 60 * 1000, // Refetch every minute
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
};
