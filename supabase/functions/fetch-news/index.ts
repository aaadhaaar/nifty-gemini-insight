
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ApiUsageManager } from './utils/apiUsageManager.ts'
import { NewsSearcher } from './utils/newsSearcher.ts'
import { cleanupOldArticles } from './utils/databaseCleanup.ts'
import { generateMarketAnalysis } from './services/marketAnalysisService.ts'
import { SearchQueries } from './utils/searchQueries.ts'
import { 
  determineIndianMarketSentiment,
  determineIndianMarketImpact,
  extractIndianCompanies,
  getIndianMarketPriorityBoost
} from './utils/indianMarketUtils.ts'
import {
  calculateIndianMarketEfficiency,
  calculateIndianMarketAdvantage
} from './utils/marketCalculations.ts'
import { generateIndianMarketFallbackIntelligence } from './services/fallbackIntelligenceService.ts'

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
    const forceRefresh = body.forceRefresh || false

    console.log(`Indian Market Intelligence System - ${searchIntensity} intensity at hour ${timeContext}`)
    
    // Enhanced API usage manager for Indian market intelligence
    const apiManager = new ApiUsageManager(supabaseClient)
    const { canProceed, currentSearches, remainingSearches } = await apiManager.checkDailyUsage()

    // Force API calls when explicitly requested
    if (!canProceed && !forceRefresh) {
      console.log(`Daily API limit reached: ${currentSearches}/60 - generating Indian market enhanced fallback`)
      
      // Generate enhanced Indian market fallback
      await generateIndianMarketFallbackIntelligence(supabaseClient, searchIntensity)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Indian Market enhanced fallback intelligence generated',
          eventsProcessed: 4,
          searchesUsed: 0,
          remainingSearches: 0,
          dailyLimit: 60,
          mode: 'indian_market_fallback',
          intelligenceType: 'Indian Market AI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Clean up old articles first
    await cleanupOldArticles(supabaseClient)

    // Enhanced Indian market search allocation
    const newsSearcher = new NewsSearcher(Deno.env.get('BRAVE_SEARCH_API_KEY') ?? '')
    let searchQueries = []
    let maxSearches = 1
    
    switch (searchIntensity) {
      case 'high':
        searchQueries = [...SearchQueries.getIndianMarketQueries(), ...SearchQueries.getSectorSpecificQueries()]
        maxSearches = Math.min(6, remainingSearches) // Increased for comprehensive coverage
        break
      case 'pre-market':
        searchQueries = SearchQueries.getPreMarketQueries()
        maxSearches = Math.min(4, remainingSearches)
        break
      case 'post-market':
        searchQueries = SearchQueries.getPostMarketQueries()
        maxSearches = Math.min(4, remainingSearches)
        break
      default:
        searchQueries = SearchQueries.getIndianMarketQueries()
        maxSearches = Math.min(3, remainingSearches)
    }
    
    const allMarketEvents = []

    // Execute Indian market intelligence searches
    for (let i = 0; i < maxSearches; i++) {
      const query = searchQueries[i] || searchQueries[0]
      console.log(`Executing Indian Market Intelligence search ${i + 1}/${maxSearches}: ${query}`)
      
      const marketEvents = await newsSearcher.searchIndianMarketEvents(query, searchIntensity)
      allMarketEvents.push(...marketEvents)

      await apiManager.updateUsageCount(currentSearches, i + 1)
      
      // Brief delay between calls for optimal API performance
      if (i < maxSearches - 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
      }
    }

    // Enhanced sorting with Indian market prioritization
    allMarketEvents.sort((a, b) => {
      const indianMarketBoostA = getIndianMarketPriorityBoost(a.title, a.description)
      const indianMarketBoostB = getIndianMarketPriorityBoost(b.title, b.description)
      const braveAiBoostA = a.brave_ai_summary ? 60 : 0
      const braveAiBoostB = b.brave_ai_summary ? 60 : 0
      
      const scoreA = (a.confidence * a.freshness_score * (a.impact_magnitude || 1)) + (a.time_relevance || 0) + indianMarketBoostA + braveAiBoostA
      const scoreB = (b.confidence * b.freshness_score * (b.impact_magnitude || 1)) + (b.time_relevance || 0) + indianMarketBoostB + braveAiBoostB
      return scoreB - scoreA
    })
    
    // Enhanced event selection with Indian market priority
    const eventLimit = searchIntensity === 'high' ? 20 : searchIntensity === 'pre-market' || searchIntensity === 'post-market' ? 16 : 12
    const topMarketEvents = allMarketEvents.slice(0, eventLimit)

    console.log(`Indian Market Intelligence: ${topMarketEvents.length} AI-analyzed events (${searchIntensity} intensity)`)

    // Store Indian market events with enhanced categorization
    for (const event of topMarketEvents) {
      await supabaseClient
        .from('news_articles')
        .insert({
          title: event.title,
          content: event.ai_summary,
          summary: event.market_implications,
          sentiment: determineIndianMarketSentiment(event.market_implications),
          market_impact: determineIndianMarketImpact(event.confidence, searchIntensity, event.impact_magnitude || 0, !!event.brave_ai_summary),
          category: event.event_type,
          source: event.source,
          url: null,
          companies: extractIndianCompanies(event.description),
        })
    }

    // Generate Indian market enhanced analysis
    await generateMarketAnalysis(supabaseClient, topMarketEvents, searchIntensity)

    const braveAiEventCount = topMarketEvents.filter(e => e.brave_ai_summary).length
    const indianMarketEventCount = topMarketEvents.filter(e => 
      e.title.toLowerCase().includes('indian') || 
      e.title.toLowerCase().includes('nifty') || 
      e.title.toLowerCase().includes('sensex')
    ).length

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: topMarketEvents.length,
        indianMarketEvents: indianMarketEventCount,
        braveAiEvents: braveAiEventCount,
        searchesUsed: maxSearches,
        remainingSearches: remainingSearches - maxSearches,
        dailyLimit: 60,
        competitiveIntensity: searchIntensity,
        timeContext: timeContext,
        coverage: `Indian Market Intelligence Enhanced (${currentSearches + maxSearches}/60 calls)`,
        efficiency: calculateIndianMarketEfficiency(timeContext, searchIntensity, maxSearches, braveAiEventCount),
        marketAdvantage: calculateIndianMarketAdvantage(topMarketEvents.length, indianMarketEventCount, braveAiEventCount, searchIntensity),
        intelligenceType: 'Indian Market AI Enhanced'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in Indian Market Intelligence function:', error)
    return new Response(
      JSON.stringify({ error: error.message, intelligenceType: 'Indian Market AI' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
