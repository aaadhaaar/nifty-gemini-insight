
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

    console.log('Starting comprehensive market news fetch process...')
    
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
    
    // Broadened market news search queries - targeting recent AND relevant content
    const comprehensiveMarketQueries = [
      'Nifty 50 Sensex BSE NSE Indian stock market news today breaking live',
      'Indian stock market earnings results RBI monetary policy rate decision',
      'India IPO listing FII DII foreign investment flows market impact',
      'Banking sector IT pharma auto stocks India market performance news',
      'Indian rupee USD forex crude oil gold commodity market news',
      'SEBI regulations Indian capital markets corporate governance news',
      'Mutual funds SIP investment India market trends analysis',
      'Startup unicorn funding India venture capital private equity news'
    ]

    const maxSearchesToday = Math.min(8, maxDailySearches - currentSearches)
    const allMarketNews = []

    // Clean up old news articles (older than 7 days instead of 2)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    await supabaseClient
      .from('news_articles')
      .delete()
      .lt('created_at', oneWeekAgo.toISOString())

    await supabaseClient
      .from('market_analysis')
      .delete()
      .lt('created_at', oneWeekAgo.toISOString())

    console.log('Cleaned up articles older than 7 days')

    for (let i = 0; i < maxSearchesToday; i++) {
      const query = comprehensiveMarketQueries[i]
      console.log(`Searching for market news: ${query}`)
      
      try {
        // Use 'pw' (past week) for broader results, then filter for relevance
        const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=15&freshness=pw&country=IN&search_lang=en&result_filter=web`, {
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
        console.log(`Found ${results.length} results for market news query`)

        // Update API usage count
        await supabaseClient
          .from('api_usage')
          .upsert({
            date: today,
            api_name: 'brave_search',
            search_count: currentSearches + i + 1
          })

        // Extract and filter for relevant market news
        for (const result of results) {
          if (!result.title || !result.description) continue

          if (isRelevantMarketNews(result.title, result.description)) {
            const freshnessScore = calculateFreshnessScore(result.title, result.description)
            
            allMarketNews.push({
              title: result.title,
              description: result.description,
              url: result.url || '',
              source: extractDomain(result.url || ''),
              timestamp: new Date().toISOString(),
              freshness_score: freshnessScore
            })
          }
        }
      } catch (searchError) {
        console.error(`Error processing market news query "${query}":`, searchError)
        continue
      }
    }

    // Sort by freshness score and relevance
    allMarketNews.sort((a, b) => b.freshness_score - a.freshness_score)
    const topMarketNews = allMarketNews.slice(0, 12) // Increased from 8 to 12

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
        remainingSearches: maxDailySearches - (currentSearches + maxSearchesToday),
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

async function generateMarketAnalysis(supabaseClient: any, marketNews: any[]) {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, skipping market analysis')
      return
    }

    // Process news in batches for better analysis
    const batchSize = 4
    for (let i = 0; i < marketNews.length; i += batchSize) {
      const newsBatch = marketNews.slice(i, i + batchSize)
      const newsText = newsBatch.map(news => 
        `${news.title}: ${news.description}`
      ).join('\n\n')

      const prompt = `Analyze these Indian market news articles and create comprehensive market insights:

      News Articles:
      ${newsText}

      Provide analysis in this exact JSON format:
      {
        "articles": [
          {
            "title": "Clear, impactful headline",
            "content": "Detailed explanation of what happened and its market implications",
            "summary": "Brief 2-3 sentence summary",
            "sentiment": "positive|negative|neutral",
            "market_impact": "high|medium|low",
            "category": "Market category (e.g., Banking, Technology, Policy)",
            "companies": ["company1", "company2"],
            "source": "News source name"
          }
        ],
        "market_overview": "Overall market situation analysis",
        "key_insights": [
          {
            "insight": "Key market insight",
            "impact_strength": "very_weak|weak|moderate|strong|very_strong",
            "impact_direction": "positive|negative|neutral"
          }
        ]
      }

      Focus on creating actionable, well-structured news articles with clear market implications. Respond only with valid JSON.`

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
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        console.error('Gemini API error for market analysis:', response.status)
        continue
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        console.error('No generated text from Gemini for market analysis')
        continue
      }

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in Gemini market analysis response')
        continue
      }

      const analysis = JSON.parse(jsonMatch[0])
      
      // Insert processed articles into news_articles table
      if (analysis.articles && Array.isArray(analysis.articles)) {
        for (const article of analysis.articles) {
          await supabaseClient
            .from('news_articles')
            .insert({
              title: article.title || 'Market News',
              content: article.content || '',
              summary: article.summary || '',
              sentiment: article.sentiment || 'neutral',
              market_impact: article.market_impact || 'medium',
              category: article.category || 'Market News',
              companies: article.companies || [],
              source: article.source || 'Market Intelligence'
            })
        }
      }

      // Insert market analysis insights
      if (analysis.key_insights && Array.isArray(analysis.key_insights)) {
        for (const insight of analysis.key_insights.slice(0, 2)) {
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

          const impactValue = strengthToNumeric(insight.impact_strength || 'moderate')
          const directionMultiplier = insight.impact_direction === 'negative' ? -1 : 
                                     insight.impact_direction === 'positive' ? 1 : 0

          await supabaseClient
            .from('market_analysis')
            .insert({
              what_happened: insight.insight || 'Market development',
              why_matters: `Market impact: ${insight.impact_strength || 'moderate'} ${insight.impact_direction || 'neutral'}`,
              market_impact_description: insight.insight || 'Market analysis',
              expected_points_impact: impactValue * directionMultiplier,
              confidence_score: 75
            })
        }
      }
    }

    console.log('Market analysis completed successfully')

  } catch (error) {
    console.error('Error generating market analysis:', error)
  }
}

function isRelevantMarketNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  // Broadened relevant keywords for Indian market news
  const relevantKeywords = [
    'nifty', 'sensex', 'bse', 'nse', 'stock market', 'shares', 'equity', 'index',
    'rbi', 'sebi', 'policy', 'rate', 'inflation', 'gdp', 'budget', 'fiscal',
    'earnings', 'results', 'quarterly', 'profit', 'revenue', 'growth',
    'ipo', 'listing', 'merger', 'acquisition', 'fii', 'dii', 'investment',
    'banking', 'financial', 'fintech', 'insurance', 'nbfc',
    'it sector', 'technology', 'software', 'pharma', 'healthcare', 'auto', 'automobile',
    'energy', 'oil', 'gas', 'renewable', 'infrastructure', 'real estate',
    'rupee', 'dollar', 'forex', 'currency', 'commodity', 'gold', 'silver',
    'mutual fund', 'sip', 'portfolio', 'trading', 'investor', 'market cap',
    'startup', 'unicorn', 'funding', 'venture capital', 'private equity'
  ]
  
  // Quality indicators (positive signals)
  const qualityKeywords = [
    'breaking', 'announced', 'reported', 'launched', 'approved', 'signed',
    'increased', 'decreased', 'growth', 'decline', 'performance', 'impact',
    'analysis', 'outlook', 'forecast', 'trend', 'update', 'news'
  ]
  
  // Avoid spam/irrelevant content
  const excludeKeywords = [
    'horoscope', 'astrology', 'celebrity', 'bollywood', 'cricket', 'football',
    'weather', 'traffic', 'recipe', 'health tips', 'lifestyle', 'entertainment'
  ]
  
  const hasRelevant = relevantKeywords.some(keyword => text.includes(keyword))
  const hasQuality = qualityKeywords.some(keyword => text.includes(keyword))
  const hasExcluded = excludeKeywords.some(keyword => text.includes(keyword))
  
  return hasRelevant && hasQuality && !hasExcluded
}

function calculateFreshnessScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase()
  let score = 5 // Base score
  
  // Time-based freshness indicators
  const ultraFreshKeywords = ['today', 'now', 'live', 'breaking', 'just', 'minutes ago', 'hours ago']
  const freshKeywords = ['this week', 'recently', 'latest', 'current', 'new', 'update']
  const moderateKeywords = ['this month', 'announced', 'reported', 'launched']
  
  if (ultraFreshKeywords.some(keyword => text.includes(keyword))) {
    score += 5
  } else if (freshKeywords.some(keyword => text.includes(keyword))) {
    score += 3
  } else if (moderateKeywords.some(keyword => text.includes(keyword))) {
    score += 1
  }
  
  // Market relevance boost
  const highImpactKeywords = ['nifty', 'sensex', 'rbi', 'policy', 'earnings', 'ipo']
  if (highImpactKeywords.some(keyword => text.includes(keyword))) {
    score += 2
  }
  
  return score
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
    if (domain.includes('bloomberg')) return 'Bloomberg'
    if (domain.includes('reuters')) return 'Reuters'
    return domain
  } catch {
    return 'Market Intelligence'
  }
}
