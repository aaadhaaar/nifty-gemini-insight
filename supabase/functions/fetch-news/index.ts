
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

    console.log('Starting market events fetch process...')
    
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
    
    // Market event focused search queries
    const marketEventQueries = [
      'Nifty 50 market events today India stock market breaking news',
      'BSE Sensex major events corporate earnings RBI policy India',
      'Indian stock market events mergers acquisitions IPO today',
      'FII DII investment flows India stock market events',
      'Indian banking sector events financial results policy changes'
    ]

    const maxSearchesToday = Math.min(5, maxDailySearches - currentSearches)
    const allMarketEvents = []

    for (let i = 0; i < maxSearchesToday; i++) {
      const query = marketEventQueries[i]
      console.log(`Searching for market events: ${query}`)
      
      try {
        const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&freshness=pd&country=IN`, {
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
        console.log(`Found ${results.length} results for market events query`)

        // Update API usage count
        await supabaseClient
          .from('api_usage')
          .upsert({
            date: today,
            api_name: 'brave_search',
            search_count: currentSearches + i + 1
          })

        // Extract market events from search results
        for (const result of results) {
          if (!result.title || !result.description) continue

          if (isRelevantMarketEvent(result.title, result.description)) {
            allMarketEvents.push({
              title: result.title,
              description: result.description,
              url: result.url || '',
              source: extractDomain(result.url || ''),
              timestamp: new Date().toISOString()
            })
          }
        }
      } catch (searchError) {
        console.error(`Error processing market events query "${query}":`, searchError)
        continue
      }
    }

    console.log(`Collected ${allMarketEvents.length} market events`)

    // Generate comprehensive market impact analysis
    if (allMarketEvents.length > 0) {
      await generateComprehensiveMarketAnalysis(supabaseClient, allMarketEvents)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsProcessed: allMarketEvents.length,
        searchesUsed: maxSearchesToday,
        remainingSearches: maxDailySearches - (currentSearches + maxSearchesToday)
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
          "expected_points_impact": number (estimated Nifty 50 points impact, -200 to +200),
          "confidence_score": number (0-100)
        }
      ],
      "overall_sentiment": "positive|negative|neutral",
      "overall_expected_impact": number (total estimated Nifty 50 points impact),
      "risk_factors": ["factor1", "factor2"],
      "opportunities": ["opportunity1", "opportunity2"]
    }

    Focus on Indian market context, Nifty 50 impact, and provide specific, actionable insights. Respond only with valid JSON.`

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
    
    // Create a comprehensive market analysis entry
    const { error: analysisError } = await supabaseClient
      .from('market_analysis')
      .insert({
        news_article_id: null, // This is a comprehensive analysis, not tied to a specific article
        what_happened: marketAnalysis.market_overview || 'Market events analysis',
        why_matters: `Key factors: ${marketAnalysis.risk_factors?.join(', ') || 'Multiple market factors'}. Opportunities: ${marketAnalysis.opportunities?.join(', ') || 'Various opportunities'}`,
        market_impact_description: marketAnalysis.key_events?.map(e => `${e.event}: ${e.impact}`).join('. ') || 'Market impact from multiple events',
        expected_points_impact: marketAnalysis.overall_expected_impact || 0,
        confidence_score: 85 // High confidence for comprehensive analysis
      })

    if (analysisError) {
      console.error('Error inserting comprehensive market analysis:', analysisError)
    } else {
      console.log('Comprehensive market analysis generated successfully')
    }

    // Also create individual event analyses
    if (marketAnalysis.key_events && Array.isArray(marketAnalysis.key_events)) {
      for (const event of marketAnalysis.key_events.slice(0, 3)) { // Limit to top 3 events
        await supabaseClient
          .from('market_analysis')
          .insert({
            news_article_id: null,
            what_happened: event.event || 'Market event',
            why_matters: event.impact || 'Market impact',
            market_impact_description: `Sectors affected: ${event.sectors_affected?.join(', ') || 'Multiple sectors'}. ${event.impact || ''}`,
            expected_points_impact: event.expected_points_impact || 0,
            confidence_score: event.confidence_score || 70
          })
      }
    }

  } catch (error) {
    console.error('Error generating comprehensive market analysis:', error)
  }
}

function isRelevantMarketEvent(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  const relevantKeywords = [
    'nifty', 'sensex', 'bse', 'nse', 'stock market', 'shares', 'equity',
    'rbi', 'policy', 'rate', 'inflation', 'gdp', 'budget',
    'earnings', 'results', 'quarterly', 'profit', 'loss',
    'ipo', 'merger', 'acquisition', 'fii', 'dii',
    'banking', 'financial', 'it sector', 'pharma', 'auto',
    'crude oil', 'rupee', 'dollar', 'forex'
  ]
  
  const irrelevantKeywords = [
    'cricket', 'bollywood', 'politics', 'weather', 'crime',
    'celebrity', 'entertainment', 'sports', 'fashion'
  ]
  
  const hasRelevant = relevantKeywords.some(keyword => text.includes(keyword))
  const hasIrrelevant = irrelevantKeywords.some(keyword => text.includes(keyword))
  
  return hasRelevant && !hasIrrelevant
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
    return domain
  } catch {
    return 'Market Analysis'
  }
}
