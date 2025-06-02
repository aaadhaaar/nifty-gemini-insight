
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching news:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} articles`)
      return data as NewsArticle[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useFetchNews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      console.log('Calling fetch-news function...')
      const { data, error } = await supabase.functions.invoke('fetch-news');
      
      if (error) {
        console.error('Error calling fetch-news function:', error);
        throw error;
      }

      console.log('Fetch-news function completed:', data)
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch news data after successful fetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      }, 3000); // Wait a bit for the edge function to complete
    },
  });
};
