
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

    // Get strategic context from request
    const body = await req.json().catch(() => ({}))
    const searchIntensity = body.searchIntensity || 'standard'
    const timeContext = body.timeContext || new Date().getHours()

    console.log(`Strategic market fetch - ${searchIntensity} intensity at hour ${timeContext}`)
    
    // Enhanced API usage manager with strategic allocation
    const apiManager = new ApiUsageManager(supabaseClient)
    const { canProceed, currentSearches, remainingSearches } = await apiManager.checkDailyUsage()

    if (!canProceed) {
      console.log(`Daily strategic limit reached: ${currentSearches}/60`)
      return new Response(
        JSON.stringify({ success: false, message: 'Daily strategic API limit reached (60 calls)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Clean up old articles first
    await cleanupOldArticles(supabaseClient)

    // Strategic search allocation based on time and intensity
    const newsSearcher = new NewsSearcher(Deno.env.get('BRAVE_SEARCH_API_KEY') ?? '')
    let searchQueries = []
    let maxSearches = 1 // Default conservative
    
    switch (searchIntensity) {
      case 'high': // Market open/close - maximum coverage
        searchQueries = newsSearcher.getHighPriorityQueries()
        maxSearches = Math.min(3, remainingSearches)
        break
      case 'pre-market': // Pre-market focus on overnight developments
        searchQueries = newsSearcher.getPreMarketQueries()
        maxSearches = Math.min(2, remainingSearches)
        break
      case 'post-market': // Post-market analysis focus
        searchQueries = newsSearcher.getPostMarketQueries()
        maxSearches = Math.min(2, remainingSearches)
        break
      default: // Standard market hours
        searchQueries = newsSearcher.getOptimizedMarketEventQueries()
        maxSearches = Math.min(1, remainingSearches)
    }
    
    const allMarketEvents = []

    // Execute strategic searches
    for (let i = 0; i < maxSearches; i++) {
      const query = searchQueries[i] || searchQueries[0] // Fallback to first query
      const marketEvents = await newsSearcher.searchMarketEvents(query, searchIntensity)
      allMarketEvents.push(...marketEvents)

      // Update API usage count incrementally
      await apiManager.updateUsageCount(currentSearches, i + 1)
    }

    // Enhanced sorting with time-based relevance
    allMarketEvents.sort((a, b) => {
      const scoreA = (a.confidence * a.freshness_score) + (a.time_relevance || 0)
      const scoreB = (b.confidence * b.freshness_score) + (b.time_relevance || 0)
      return scoreB - scoreA
    })
    
    // Strategic event selection based on intensity
    const eventLimit = searchIntensity === 'high' ? 12 : searchIntensity === 'pre-market' || searchIntensity === 'post-market' ? 8 : 6
    const topMarketEvents = allMarketEvents.slice(0, eventLimit)

    console.log(`Strategic collection: ${topMarketEvents.length} AI-analyzed events (${searchIntensity} intensity)`)

    // Store market events with strategic categorization
    for (const event of topMarketEvents) {
      await supabaseClient
        .from('news_articles')
        .insert({
          title: event.title,
          content: event.ai_summary,
          summary: event.market_implications,
          sentiment: determineSentiment(event.market_implications),
          market_impact: determineImpact(event.confidence, searchIntensity),
          category: event.event_type,
          source: event.source,
          url: null,
          companies: extractCompanies(event.description),
        })
    }

    // Generate strategic market analysis
    if (topMarketEvents.length > 0) {
      await generateMarketAnalysis(supabaseClient, topMarketEvents, searchIntensity)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: topMarketEvents.length,
        searchesUsed: maxSearches,
        remainingSearches: remainingSearches - maxSearches,
        dailyLimit: 60,
        strategicIntensity: searchIntensity,
        timeContext: timeContext,
        coverage: `Strategic AI market intelligence (${currentSearches + maxSearches}/60 calls)`,
        efficiency: calculateEfficiency(timeContext, searchIntensity, maxSearches)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in strategic fetch-news function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})

function determineSentiment(implications: string): string {
  const positive = ['positive', 'boost', 'growth', 'opportunity', 'strong', 'beat', 'surge', 'rally']
  const negative = ['headwind', 'decline', 'risk', 'concern', 'weak', 'challenge', 'fall', 'crash']
  
  const lowerImplications = implications.toLowerCase()
  const positiveCount = positive.filter(word => lowerImplications.includes(word)).length
  const negativeCount = negative.filter(word => lowerImplications.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function determineImpact(confidence: number, intensity: string): string {
  // Boost impact during high-intensity periods
  const boost = intensity === 'high' ? 10 : intensity === 'pre-market' || intensity === 'post-market' ? 5 : 0
  const adjustedConfidence = confidence + boost
  
  if (adjustedConfidence >= 85) return 'high'
  if (adjustedConfidence >= 65) return 'medium'
  return 'low'
}

function extractCompanies(description: string): string[] {
  const companies = []
  const commonCompanies = ['TCS', 'Infosys', 'Reliance', 'HDFC', 'ICICI', 'SBI', 'Wipro', 'Bharti Airtel', 'ITC', 'HUL', 'Adani', 'Tata Motors', 'L&T', 'Asian Paints']
  
  for (const company of commonCompanies) {
    if (description.toUpperCase().includes(company.toUpperCase())) {
      companies.push(company)
    }
  }
  
  return companies
}

function calculateEfficiency(hour: number, intensity: string, searches: number): string {
  const isMarketHours = hour >= 9 && hour <= 16
  const isPeakHours = (hour >= 9 && hour < 10) || (hour >= 15.5 && hour < 16)
  
  if (isPeakHours && intensity === 'high') return 'Maximum Efficiency'
  if (isMarketHours && searches > 1) return 'High Efficiency'
  if (isMarketHours) return 'Good Efficiency'
  if (intensity === 'pre-market' || intensity === 'post-market') return 'Strategic Efficiency'
  return 'Conservation Mode'
}
