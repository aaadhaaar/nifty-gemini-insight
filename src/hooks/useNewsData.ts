
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
    queryKey: ['fresh-news-articles'],
    queryFn: async () => {
      console.log('Fetching ultra-fresh news articles from database...')
      
      // Only get articles from the last 24 hours for maximum freshness
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error fetching fresh news:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} ultra-fresh articles (last 24h)`)
      return data as NewsArticle[];
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes for fresh data
    staleTime: 10 * 60 * 1000, // Consider data stale after 10 minutes
  });
};
