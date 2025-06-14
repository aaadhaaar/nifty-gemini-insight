
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

    console.log('Starting optimized market events fetch for free tier...')
    
    // Initialize API usage manager with conservative limits
    const apiManager = new ApiUsageManager(supabaseClient)
    const { canProceed, currentSearches, remainingSearches } = await apiManager.checkDailyUsage()

    if (!canProceed) {
      console.log(`Free tier daily limit reached: ${currentSearches}/8`)
      return new Response(
        JSON.stringify({ success: false, message: 'Daily API limit reached for free tier' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Clean up old articles first
    await cleanupOldArticles(supabaseClient)

    // Initialize news searcher for market events
    const newsSearcher = new NewsSearcher(Deno.env.get('BRAVE_SEARCH_API_KEY') ?? '')
    const searchQueries = newsSearcher.getOptimizedMarketEventQueries() // Use optimized queries
    
    const maxSearchesToday = Math.min(2, remainingSearches) // Very conservative: max 2 searches per call
    const allMarketEvents = []

    // Search for market events with optimized approach
    for (let i = 0; i < maxSearchesToday; i++) {
      const query = searchQueries[i]
      const marketEvents = await newsSearcher.searchMarketEvents(query)
      allMarketEvents.push(...marketEvents)

      // Update API usage count
      await apiManager.updateUsageCount(currentSearches, i + 1)
    }

    // Sort by confidence and freshness
    allMarketEvents.sort((a, b) => (b.confidence * b.freshness_score) - (a.confidence * a.freshness_score))
    const topMarketEvents = allMarketEvents.slice(0, 8) // Reduced from 15 for efficiency

    console.log(`Collected ${topMarketEvents.length} AI-analyzed market events (optimized for free tier)`)

    // Store market events as structured news articles
    for (const event of topMarketEvents) {
      await supabaseClient
        .from('news_articles')
        .insert({
          title: event.title,
          content: event.ai_summary,
          summary: event.market_implications,
          sentiment: this.determineSentiment(event.market_implications),
          market_impact: this.determineImpact(event.confidence),
          category: event.event_type,
          source: event.source,
          url: null,
          companies: this.extractCompanies(event.description),
        })
    }

    // Generate enhanced market analysis from events with batch processing
    if (topMarketEvents.length > 0) {
      await generateMarketAnalysis(supabaseClient, topMarketEvents)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: topMarketEvents.length,
        searchesUsed: maxSearchesToday,
        remainingSearches: remainingSearches - maxSearchesToday,
        coverage: 'Optimized AI-powered market events (free tier)',
        optimization: 'Conservative API usage for free tier'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in optimized fetch-news function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})

function determineSentiment(implications: string): string {
  const positive = ['positive', 'boost', 'growth', 'opportunity', 'strong', 'beat']
  const negative = ['headwind', 'decline', 'risk', 'concern', 'weak', 'challenge']
  
  const lowerImplications = implications.toLowerCase()
  const positiveCount = positive.filter(word => lowerImplications.includes(word)).length
  const negativeCount = negative.filter(word => lowerImplications.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function determineImpact(confidence: number): string {
  if (confidence >= 80) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

function extractCompanies(description: string): string[] {
  // Simple company extraction - can be enhanced
  const companies = []
  const commonCompanies = ['TCS', 'Infosys', 'Reliance', 'HDFC', 'ICICI', 'SBI', 'Wipro', 'Bharti Airtel', 'ITC', 'HUL']
  
  for (const company of commonCompanies) {
    if (description.toUpperCase().includes(company.toUpperCase())) {
      companies.push(company)
    }
  }
  
  return companies
}
