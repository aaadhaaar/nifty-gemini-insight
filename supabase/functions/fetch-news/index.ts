import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ApiUsageManager } from './utils/apiUsageManager.ts'
import { cleanupOldArticles } from './utils/databaseCleanup.ts'
import { GeminiAnalysisService } from './services/geminiAnalysisService.ts'
import { RealTimeMarketService } from './services/realTimeMarketService.ts'
import { 
  determineIndianMarketSentiment,
  determineIndianMarketImpact,
  extractIndianCompanies
} from './utils/indianMarketUtils.ts'

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

    const body = await req.json().catch(() => ({}))
    const searchIntensity = body.searchIntensity || 'standard'
    const forceRefresh = body.forceRefresh || false

    console.log(`Enhanced Market Intelligence System - ${searchIntensity} intensity`)
    
    const apiManager = new ApiUsageManager(supabaseClient)
    const { canProceed, currentSearches, remainingSearches } = await apiManager.checkDailyUsage()

    if (!canProceed && !forceRefresh) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'API quota reached. No market events generated.',
          eventsProcessed: 0,
          searchesUsed: 0,
          mode: 'quota_exceeded'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    await cleanupOldArticles(supabaseClient)

    // Initialize services
    const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY') ?? ''
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    
    const marketService = new RealTimeMarketService(braveApiKey, geminiApiKey)
    const geminiService = new GeminiAnalysisService(geminiApiKey)

    // Get real market events
    const rawEvents = await marketService.getCurrentMarketEvents()
    console.log(`Retrieved ${rawEvents.length} raw market events`)

    // Enhance with Gemini AI analysis
    const enhancedEvents = await geminiService.analyzeMarketEvents(rawEvents)
    console.log(`Enhanced ${enhancedEvents.length} events with AI analysis`)

    // Store enhanced events
    for (const event of enhancedEvents) {
      await supabaseClient
        .from('news_articles')
        .insert({
          title: event.title,
          content: event.ai_enhanced_analysis || event.description,
          summary: event.market_implications,
          sentiment: determineIndianMarketSentiment(event.market_implications || event.description),
          market_impact: determineIndianMarketImpact(event.confidence, searchIntensity, 20, true),
          category: event.event_type,
          source: event.source,
          url: event.url,
          companies: extractIndianCompanies(event.description),
        })
    }

    await apiManager.updateUsageCount(currentSearches, 2) // Used 2 API calls

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: enhancedEvents.length,
        aiEnhancedEvents: enhancedEvents.filter(e => e.ai_enhanced_analysis).length,
        searchesUsed: 2,
        remainingSearches: remainingSearches - 2,
        mode: 'real_time_enhanced',
        intelligenceType: 'Gemini Enhanced Market Intelligence'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (error) {
    console.error('Error in Enhanced Market Intelligence function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
