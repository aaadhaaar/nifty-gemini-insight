
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ImpactAnalysisData {
  id: string;
  news_article_id: string | null;
  what_happened: string;
  why_matters: string;
  market_impact_description: string;
  expected_points_impact: number;
  confidence_score: number;
  created_at: string;
}

export const useImpactAnalysis = () => {
  return useQuery({
    queryKey: ['impact-analysis'],
    queryFn: async () => {
      console.log('Fetching impact analysis data...');
      
      const { data, error } = await supabase
        .from('market_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching impact analysis:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} impact analysis records`);
      return data as ImpactAnalysisData[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for more frequent updates
  });
};
