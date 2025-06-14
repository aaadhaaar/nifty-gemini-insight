import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

    console.log('Starting fresh market events fetch process...')
    
    // Check today's API usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabaseClient
      .from('api_usage')
      .select('search_count')
      .eq('date', today)
      .eq('api_name', 'brave_search')
      .maybeSingle()

    const currentSearches = usageData?.search_count || 0
    const maxDailySearches = 55

    if (currentSearches >= maxDailySearches) {
      console.log(`Daily limit reached: ${currentSearches}/${maxDailySearches}`)
      return new Response(
        JSON.stringify({ success: false, message: 'Daily API limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(`Current usage: ${currentSearches}/${maxDailySearches} searches`)
    
    // Fresh market event focused search queries - targeting TODAY's news
    const freshMarketEventQueries = [
      'Nifty 50 Sensex today live market news India stock exchange BSE NSE breaking',
      'Indian stock market today earnings results RBI policy announcement live',
      'India market news today IPO merger acquisition FII DII investment flows',
      'BSE NSE today sector performance banking IT pharma auto stocks live',
      'Indian rupee forex crude oil gold market impact today live news'
    ]

    const maxSearchesToday = Math.min(5, maxDailySearches - currentSearches)
    const allMarketEvents = []

    // Clean up old news articles first (older than 48 hours)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    
    await supabaseClient
      .from('news_articles')
      .delete()
      .lt('created_at', twoDaysAgo.toISOString())

    await supabaseClient
      .from('market_analysis')
      .delete()
      .lt('created_at', twoDaysAgo.toISOString())

    console.log('Cleaned up articles older than 48 hours')

    for (let i = 0; i < maxSearchesToday; i++) {
      const query = freshMarketEventQueries[i]
      console.log(`Searching for TODAY's market events: ${query}`)
      
      try {
        // Use 'pd' (past day) for ultra-fresh results and add market-specific filters
        const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10&freshness=pd&country=IN&search_lang=en&result_filter=web`, {
          headers: {
            'X-Subscription-Token': Deno.env.get('BRAVE_SEARCH_API_KEY') ?? '',
            'Accept': 'application/json',
          },
        })

        if (!braveResponse.ok) {
          console.error(`Brave Search API error: ${braveResponse.status}`)
          continue
        }

        const searchData = await braveResponse.json()
        const results = searchData.web?.results || []
        console.log(`Found ${results.length} fresh results for market events query`)

        // Update API usage count
        await supabaseClient
          .from('api_usage')
          .upsert({
            date: today,
            api_name: 'brave_search',
            search_count: currentSearches + i + 1
          })

        // Extract and filter for ultra-fresh market events
        for (const result of results) {
          if (!result.title || !result.description) continue

          if (isUltraFreshMarketEvent(result.title, result.description)) {
            // Additional freshness check - prioritize results with time indicators
            const hasTimeIndicator = checkForTimeIndicators(result.title, result.description)
            
            allMarketEvents.push({
              title: result.title,
              description: result.description,
              url: result.url || '',
              source: extractDomain(result.url || ''),
              timestamp: new Date().toISOString(),
              freshness_score: hasTimeIndicator ? 10 : 8
            })
          }
        }
      } catch (searchError) {
        console.error(`Error processing fresh market events query "${query}":`, searchError)
        continue
      }
    }

    // Sort by freshness score and limit to most relevant
    allMarketEvents.sort((a, b) => b.freshness_score - a.freshness_score)
    const topFreshEvents = allMarketEvents.slice(0, 8)

    console.log(`Collected ${topFreshEvents.length} ultra-fresh market events`)

    // Generate comprehensive market impact analysis for fresh events
    if (topFreshEvents.length > 0) {
      await generateComprehensiveMarketAnalysis(supabaseClient, topFreshEvents)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: topFreshEvents.length,
        searchesUsed: maxSearchesToday,
        remainingSearches: maxDailySearches - (currentSearches + maxSearchesToday),
        freshness: 'ultra-fresh'
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

async function generateComprehensiveMarketAnalysis(supabaseClient: any, marketEvents: any[]) {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, skipping market analysis')
      return
    }

    // Combine all market events for comprehensive analysis
    const eventsText = marketEvents.map(event => 
      `${event.title}: ${event.description}`
    ).join('\n\n')

    const prompt = `Analyze these Indian stock market events and provide comprehensive market analysis in JSON format:

    Events:
    ${eventsText}

    Provide analysis in this exact JSON format:
    {
      "market_overview": "Comprehensive 3-4 sentence overview of current market situation",
      "key_events": [
        {
          "event": "Brief description of major event",
          "impact": "Specific market impact explanation",
          "sectors_affected": ["sector1", "sector2"],
          "impact_strength": "very_weak|weak|moderate|strong|very_strong",
          "impact_direction": "positive|negative|neutral",
          "confidence_score": number (0-100)
        }
      ],
      "overall_sentiment": "positive|negative|neutral",
      "overall_impact_strength": "very_weak|weak|moderate|strong|very_strong",
      "overall_impact_direction": "positive|negative|neutral",
      "risk_factors": ["factor1", "factor2"],
      "opportunities": ["opportunity1", "opportunity2"]
    }

    For impact_strength, use:
    - very_weak: Minor news with minimal market relevance
    - weak: Some market relevance but limited immediate impact
    - moderate: Notable impact on specific sectors or indices
    - strong: Significant impact likely to move markets
    - very_strong: Major event with substantial market-wide implications

    Focus on Indian market context and provide specific, actionable insights. Respond only with valid JSON.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error for market analysis:', response.status)
      return
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error('No generated text from Gemini for market analysis')
      return
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini market analysis response')
      return
    }

    const marketAnalysis = JSON.parse(jsonMatch[0])
    
    // Convert strength indicators to numeric values for database storage
    const strengthToNumeric = (strength: string): number => {
      switch (strength) {
        case 'very_weak': return -1
        case 'weak': return -0.5
        case 'moderate': return 0
        case 'strong': return 0.5
        case 'very_strong': return 1
        default: return 0
      }
    }

    // Create a comprehensive market analysis entry
    const overallImpactValue = strengthToNumeric(marketAnalysis.overall_impact_strength || 'moderate')
    const directionMultiplier = marketAnalysis.overall_impact_direction === 'negative' ? -1 : 
                               marketAnalysis.overall_impact_direction === 'positive' ? 1 : 0

    const { error: analysisError } = await supabaseClient
      .from('market_analysis')
      .insert({
        news_article_id: null,
        what_happened: marketAnalysis.market_overview || 'Market events analysis',
        why_matters: `Key factors: ${marketAnalysis.risk_factors?.join(', ') || 'Multiple market factors'}. Opportunities: ${marketAnalysis.opportunities?.join(', ') || 'Various opportunities'}`,
        market_impact_description: marketAnalysis.key_events?.map(e => `${e.event}: ${e.impact}`).join('. ') || 'Market impact from multiple events',
        expected_points_impact: overallImpactValue * directionMultiplier,
        confidence_score: 85
      })

    if (analysisError) {
      console.error('Error inserting comprehensive market analysis:', analysisError)
    } else {
      console.log('Comprehensive market analysis generated successfully')
    }

    // Also create individual event analyses
    if (marketAnalysis.key_events && Array.isArray(marketAnalysis.key_events)) {
      for (const event of marketAnalysis.key_events.slice(0, 3)) {
        const eventImpactValue = strengthToNumeric(event.impact_strength || 'moderate')
        const eventDirectionMultiplier = event.impact_direction === 'negative' ? -1 : 
                                       event.impact_direction === 'positive' ? 1 : 0

        await supabaseClient
          .from('market_analysis')
          .insert({
            news_article_id: null,
            what_happened: event.event || 'Market event',
            why_matters: event.impact || 'Market impact',
            market_impact_description: `Sectors affected: ${event.sectors_affected?.join(', ') || 'Multiple sectors'}. Impact: ${event.impact_strength || 'moderate'} ${event.impact_direction || 'neutral'}. ${event.impact || ''}`,
            expected_points_impact: eventImpactValue * eventDirectionMultiplier,
            confidence_score: event.confidence_score || 70
          })
      }
    }

  } catch (error) {
    console.error('Error generating comprehensive market analysis:', error)
  }
}

function isUltraFreshMarketEvent(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  // Enhanced keywords for fresh market events
  const relevantKeywords = [
    'nifty', 'sensex', 'bse', 'nse', 'stock market', 'shares', 'equity',
    'rbi', 'policy', 'rate', 'inflation', 'gdp', 'budget',
    'earnings', 'results', 'quarterly', 'profit', 'loss',
    'ipo', 'merger', 'acquisition', 'fii', 'dii',
    'banking', 'financial', 'it sector', 'pharma', 'auto',
    'crude oil', 'rupee', 'dollar', 'forex', 'live', 'breaking'
  ]
  
  // Strong freshness indicators
  const freshnessKeywords = [
    'today', 'live', 'breaking', 'now', 'latest', 'just in',
    'this morning', 'this afternoon', 'current', 'ongoing',
    'right now', 'minutes ago', 'hours ago', 'real time'
  ]
  
  // Outdated indicators to avoid
  const outdatedKeywords = [
    'yesterday', 'last week', 'previous', 'former', 'old',
    'days ago', 'week ago', 'month ago', 'historical'
  ]
  
  const hasRelevant = relevantKeywords.some(keyword => text.includes(keyword))
  const hasFresh = freshnessKeywords.some(keyword => text.includes(keyword))
  const hasOutdated = outdatedKeywords.some(keyword => text.includes(keyword))
  
  // Must be relevant AND fresh AND not outdated
  return hasRelevant && hasFresh && !hasOutdated
}

function checkForTimeIndicators(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  const timeIndicators = [
    'live', 'breaking', 'now', 'today', 'this morning', 'this afternoon',
    'real time', 'just in', 'minutes ago', 'hours ago', 'current'
  ]
  
  return timeIndicators.some(indicator => text.includes(indicator))
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    if (domain.includes('economictimes')) return 'Economic Times'
    if (domain.includes('moneycontrol')) return 'MoneyControl'
    if (domain.includes('livemint')) return 'Mint'
    if (domain.includes('business-standard')) return 'Business Standard'
    if (domain.includes('financialexpress')) return 'Financial Express'
    if (domain.includes('zeebiz')) return 'Zee Business'
    if (domain.includes('ndtv')) return 'NDTV Business'
    if (domain.includes('cnbctv18')) return 'CNBC TV18'
    return domain
  } catch {
    return 'Live Market News'
  }
}
