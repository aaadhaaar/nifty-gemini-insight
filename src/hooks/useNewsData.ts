
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
    queryKey: ['comprehensive-news-articles'],
    queryFn: async () => {
      console.log('Fetching comprehensive news articles from database...')
      
      // Get articles from the last 3 days for better coverage
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20); // Increased limit for more articles

      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} news articles (last 3 days)`)
      return data as NewsArticle[];
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
};
