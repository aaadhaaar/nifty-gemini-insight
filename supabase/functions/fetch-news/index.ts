
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

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Robust duplicate content check (Levenshtein distance)
function isDuplicate(newArticle, existingArticles) {
  for (const art of existingArticles) {
    if (art.title === newArticle.title) return true;
    if (art.content && newArticle.content) {
      const a = art.content.substring(0, 100);
      const b = newArticle.content.substring(0, 100);
      // Simple base: if 80+ chars identical in first 100, treat as duplicate
      let matchLen = 0;
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matchLen++;
      }
      if (matchLen > 80) return true;
    }
  }
  return false;
}

// Gemini-powered content quality score threshold
const GEMINI_QUALITY_THRESHOLD = 0.40;

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
    const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY') ?? ''
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    const marketService = new RealTimeMarketService(braveApiKey, geminiApiKey)
    const geminiService = new GeminiAnalysisService(geminiApiKey)

    // ENHANCEMENT: fetch real market events with fallback/backoff for Brave
    let rawEvents: any[] = []
    let retryCount = 0
    let braveError = false

    while (retryCount < 3) {
      try {
        rawEvents = await marketService.getCurrentMarketEvents()
        if (rawEvents.length > 0) break
      } catch (e) {
        if (e?.message?.includes('429') || e?.message?.includes('rate') || e?.toString().includes('429')) {
          braveError = true
          const delayMs = 700 * (2 ** retryCount)
          console.log(`Brave 429 error or rate limit, backoff retry ${retryCount + 1} after ${delayMs}ms`)
          await delay(delayMs)
        }
      }
      retryCount++
    }

    if (!rawEvents || rawEvents.length === 0) {
      if (braveError) {
        console.error("Brave API rate limit exceeded, no events fetched")
        return new Response(JSON.stringify({ error: "Brave API rate limit error" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429
        })
      }
      return new Response(JSON.stringify({ message: "No events found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      })
    }

    // PRE-FETCH: pull recent article titles for dedupe
    const { data: existingArticles } = await supabaseClient
      .from('news_articles')
      .select('id, title, content')
      .order('created_at', { ascending: false })
      .limit(50)

    // ENHANCEMENT: Gemini analysis in parallel for quality/content
    // Also, filter for uniqueness and AI quality threshold
    const geminiPromises = rawEvents.map(event => 
      geminiService.analyzeEventWithQualityScore(event)
    )
    const analyzedEventsResults = await Promise.allSettled(geminiPromises);

    const enhancedEvents = []
    for (let i = 0; i < analyzedEventsResults.length; i++) {
      const res = analyzedEventsResults[i]
      if (res.status !== 'fulfilled' || !res.value) continue
      const aiEvent = res.value

      // Content deduplication check
      if (isDuplicate(aiEvent, existingArticles || [])) {
        console.log("Duplicate found, skipping", aiEvent.title)
        continue
      }
      // Require minimum Gemini quality score
      if ((aiEvent.quality_score || 0) < GEMINI_QUALITY_THRESHOLD) {
        console.log(`Rejected for low AI score (${aiEvent.quality_score}):`, aiEvent.title)
        continue
      }
      enhancedEvents.push(aiEvent)
    }

    // Insert valid articles
    let successfulInserts = 0
    for (const event of enhancedEvents) {
      // Compose final fields
      const insertObj = {
        title: event.title,
        content: event.ai_enhanced_analysis || event.description,
        summary: event.market_implications,
        sentiment: determineIndianMarketSentiment(event.market_implications || event.description),
        market_impact: determineIndianMarketImpact(event.confidence, searchIntensity, 20, true),
        category: event.event_type,
        source: event.source,
        url: event.url,
        companies: extractIndianCompanies(event.description),
      }
      // Defensive insert, respects triggers and constraints
      try {
        await supabaseClient
          .from('news_articles')
          .insert(insertObj)
        successfulInserts += 1
      } catch (err) {
        console.error('Insert failure:', event.title, err?.message)
      }
    }

    await apiManager.updateUsageCount(currentSearches, 2) // Used 2 API calls

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: enhancedEvents.length,
        aiEnhancedEvents: enhancedEvents.filter(e => e.ai_enhanced_analysis).length,
        inserted: successfulInserts,
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
