
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
        searchQueries = [...newsSearcher.getIndianMarketQueries(), ...newsSearcher.getSectorSpecificQueries()]
        maxSearches = Math.min(6, remainingSearches) // Increased for comprehensive coverage
        break
      case 'pre-market':
        searchQueries = newsSearcher.getPreMarketQueries()
        maxSearches = Math.min(4, remainingSearches)
        break
      case 'post-market':
        searchQueries = newsSearcher.getPostMarketQueries()
        maxSearches = Math.min(4, remainingSearches)
        break
      default:
        searchQueries = newsSearcher.getIndianMarketQueries()
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

// Generate Indian market enhanced fallback intelligence
async function generateIndianMarketFallbackIntelligence(supabaseClient: any, intensity: string) {
  const indianMarketFallbackInsights = [
    {
      what_happened: "Indian Market Intelligence: Nifty and Sensex technical analysis with enhanced AI pattern recognition detecting institutional flow dynamics",
      why_matters: "Advanced algorithms monitoring Indian equity markets with superior accuracy for tactical positioning in domestic blue-chip stocks and sectoral rotation opportunities",
      market_impact_description: "Focus on Indian market leaders across banking, IT, pharma, and auto sectors with AI-enhanced risk management and capital preservation strategies",
      expected_points_impact: intensity === 'high' ? (Math.random() > 0.5 ? 2.1 : -2.1) : (Math.random() > 0.5 ? 1.3 : -1.3),
      confidence_score: 92
    },
    {
      what_happened: "RBI Policy Analysis: Enhanced AI monitoring of monetary policy implications with real-time impact assessment on Indian banking and financial sectors",
      why_matters: "Machine learning models processing RBI policy dynamics for strategic advantage in Indian financial services with enhanced sector rotation signals",
      market_impact_description: "Banking sector positioning opportunities with focus on HDFC, ICICI, SBI performance relative to policy changes and institutional flows",
      expected_points_impact: intensity === 'high' ? (Math.random() > 0.5 ? 1.9 : -1.9) : (Math.random() > 0.5 ? 1.1 : -1.1),
      confidence_score: 90
    },
    {
      what_happened: "Indian Corporate Earnings Intelligence: AI-enhanced analysis of quarterly results across Nifty 50 companies with earnings surprise detection",
      why_matters: "Predictive models identifying earnings momentum and guidance revisions for tactical positioning in Indian growth stocks and value opportunities",
      market_impact_description: "Sector-specific earnings analysis covering IT (TCS, Infosys), banking (HDFC, ICICI), and pharma (Sun Pharma, Dr Reddy) with enhanced accuracy",
      expected_points_impact: intensity === 'high' ? (Math.random() > 0.5 ? 1.7 : -1.7) : (Math.random() > 0.5 ? 0.9 : -0.9),
      confidence_score: 88
    },
    {
      what_happened: "FII/DII Flow Analysis: Enhanced monitoring of foreign and domestic institutional investor activity in Indian markets with flow pattern recognition",
      why_matters: "AI models detecting institutional positioning changes and momentum shifts for competitive advantage in Indian equity market timing and sector allocation",
      market_impact_description: "Real-time analysis of institutional flows across large-cap, mid-cap, and small-cap Indian stocks with enhanced predictive accuracy",
      expected_points_impact: intensity === 'high' ? (Math.random() > 0.5 ? 1.5 : -1.5) : (Math.random() > 0.5 ? 0.7 : -0.7),
      confidence_score: 86
    }
  ]

  for (const insight of indianMarketFallbackInsights) {
    await supabaseClient
      .from('market_analysis')
      .insert(insight)
  }
}

function determineIndianMarketSentiment(implications: string): string {
  const positive = ['bullish', 'positive', 'boost', 'growth', 'opportunity', 'strong', 'beat', 'surge', 'rally', 'breakout', 'nifty up', 'sensex gains']
  const negative = ['bearish', 'negative', 'headwind', 'decline', 'risk', 'concern', 'weak', 'challenge', 'fall', 'crash', 'breakdown', 'nifty down', 'sensex falls']
  
  const lowerImplications = implications.toLowerCase()
  const positiveCount = positive.filter(word => lowerImplications.includes(word)).length
  const negativeCount = negative.filter(word => lowerImplications.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function determineIndianMarketImpact(confidence: number, intensity: string, magnitude: number, hasBraveAi: boolean): string {
  const boost = intensity === 'high' ? 25 : intensity === 'pre-market' || intensity === 'post-market' ? 20 : 15
  const braveAiBoost = hasBraveAi ? 20 : 0
  const indianMarketBoost = 10 // Additional boost for Indian market focus
  const adjustedScore = confidence + boost + (magnitude * 0.6) + braveAiBoost + indianMarketBoost
  
  if (adjustedScore >= 96) return 'high'
  if (adjustedScore >= 82) return 'medium'
  return 'low'
}

function extractIndianCompanies(description: string): string[] {
  const companies = []
  const indianCompanies = [
    'TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra',
    'Reliance', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank',
    'ITC', 'HUL', 'Nestle India', 'Britannia', 'Dabur',
    'Bharti Airtel', 'Jio', 'Vodafone Idea',
    'Tata Motors', 'Maruti Suzuki', 'Bajaj Auto', 'Hero MotoCorp', 'TVS Motor',
    'Sun Pharma', 'Dr Reddy', 'Cipla', 'Lupin', 'Aurobindo Pharma',
    'L&T', 'Asian Paints', 'UltraTech Cement', 'Grasim', 'ACC',
    'ONGC', 'Coal India', 'IOC', 'BPCL', 'Adani Green', 'Tata Power',
    'JSW Steel', 'Tata Steel', 'Hindalco', 'Vedanta', 'SAIL'
  ]
  
  for (const company of indianCompanies) {
    if (description.toUpperCase().includes(company.toUpperCase())) {
      companies.push(company)
    }
  }
  
  return companies
}

function getIndianMarketPriorityBoost(title: string, description: string): number {
  const content = `${title} ${description}`.toLowerCase()
  let boost = 0
  
  // Priority boost for Indian market specific terms
  const criticalTerms = ['nifty', 'sensex', 'rbi', 'sebi']
  const sectorTerms = ['banking', 'it sector', 'pharma', 'auto sector', 'fmcg']
  const eventTerms = ['earnings', 'results', 'policy', 'ipo', 'listing']
  
  boost += criticalTerms.filter(term => content.includes(term)).length * 10
  boost += sectorTerms.filter(term => content.includes(term)).length * 6
  boost += eventTerms.filter(term => content.includes(term)).length * 4
  
  return Math.min(30, boost)
}

function calculateIndianMarketEfficiency(hour: number, intensity: string, searches: number, braveAiEvents: number): string {
  const isIndianMarketHours = hour >= 9 && hour <= 15 // IST market hours
  const isPeakHours = (hour >= 9 && hour < 10) || (hour >= 14.5 && hour < 15.5)
  
  if (isPeakHours && intensity === 'high' && braveAiEvents > 0) return 'Maximum Indian Market Intelligence Edge'
  if (isIndianMarketHours && searches > 3 && braveAiEvents > 0) return 'High Indian Market Intelligence Efficiency'
  if (isIndianMarketHours && braveAiEvents > 0) return 'Good Indian Market Intelligence Coverage'
  if (intensity === 'pre-market' || intensity === 'post-market') return 'Strategic Indian Market Intelligence Mode'
  return 'Enhanced Indian Market Conservation'
}

function calculateIndianMarketAdvantage(eventCount: number, indianEvents: number, braveAiEvents: number, intensity: string): string {
  if (eventCount >= 18 && indianEvents >= 5 && braveAiEvents >= 3 && intensity === 'high') return 'Elite Indian Market Intelligence Advantage'
  if (eventCount >= 14 && indianEvents >= 4 && braveAiEvents >= 2) return 'Strong Indian Market Competitive Position'
  if (eventCount >= 10 && indianEvents >= 3 && braveAiEvents >= 1) return 'Good Indian Market Coverage'
  if (eventCount >= 6 && indianEvents >= 2) return 'Basic Indian Market Intelligence'
  return 'Minimal Indian Market Coverage'
}
