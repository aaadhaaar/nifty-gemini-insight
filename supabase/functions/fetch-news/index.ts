
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ApiUsageManager } from './utils/apiUsageManager.ts'
import { NewsSearcher } from './utils/newsSearcher.ts'
import { cleanupOldArticles } from './utils/databaseCleanup.ts'
import { generateMarketAnalysis } from './services/marketAnalysisService.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting comprehensive market news fetch process...')
    
    // Initialize API usage manager
    const apiManager = new ApiUsageManager(supabaseClient)
    const { canProceed, currentSearches, remainingSearches } = await apiManager.checkDailyUsage()

    if (!canProceed) {
      console.log(`Daily limit reached: ${currentSearches}/55`)
      return new Response(
        JSON.stringify({ success: false, message: 'Daily API limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Clean up old articles
    await cleanupOldArticles(supabaseClient)

    // Initialize news searcher
    const newsSearcher = new NewsSearcher(Deno.env.get('BRAVE_SEARCH_API_KEY') ?? '')
    const searchQueries = newsSearcher.getSearchQueries()
    
    const maxSearchesToday = Math.min(8, remainingSearches)
    const allMarketNews = []

    // Search for news articles
    for (let i = 0; i < maxSearchesToday; i++) {
      const query = searchQueries[i]
      const newsResults = await newsSearcher.searchNews(query)
      allMarketNews.push(...newsResults)

      // Update API usage count
      await apiManager.updateUsageCount(currentSearches, i + 1)
    }

    // Sort by freshness score and relevance
    allMarketNews.sort((a, b) => b.freshness_score - a.freshness_score)
    const topMarketNews = allMarketNews.slice(0, 12)

    console.log(`Collected ${topMarketNews.length} relevant market news articles`)

    // Generate market impact analysis for collected news
    if (topMarketNews.length > 0) {
      await generateMarketAnalysis(supabaseClient, topMarketNews)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesProcessed: topMarketNews.length,
        searchesUsed: maxSearchesToday,
        remainingSearches: remainingSearches - maxSearchesToday,
        coverage: 'comprehensive'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in fetch-news function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
