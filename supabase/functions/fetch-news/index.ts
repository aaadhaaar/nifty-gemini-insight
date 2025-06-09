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

    console.log('Starting news fetch process...')
    
    // Check today's API usage to respect 60 searches/day limit
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
    
    // Indian stock market focused search queries
    const searchQueries = [
      'Nifty 50 news today Indian stock market',
      'BSE Sensex latest news India stock market',
      'Indian stock market news today NSE'
    ]

    const maxSearchesToday = Math.min(3, maxDailySearches - currentSearches)
    const processedArticles = []

    for (let i = 0; i < maxSearchesToday; i++) {
      const query = searchQueries[i]
      console.log(`Searching Brave for: ${query}`)
      
      try {
        const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pd&country=IN`, {
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
        console.log(`Found ${results.length} results for query: ${query}`)

        // Update API usage count
        await supabaseClient
          .from('api_usage')
          .upsert({
            date: today,
            api_name: 'brave_search',
            search_count: currentSearches + i + 1
          })

        // Process search results - limit to top 2 per query
        for (const result of results.slice(0, 2)) {
          if (!result.title || !result.url || !result.description) continue

          // Filter for news sources and relevant content
          if (!isRelevantNewsSource(result.url, result.title)) {
            console.log(`Skipping non-news source: ${result.url}`)
            continue
          }

          console.log(`Processing potential article: ${result.title}`)

          // Check if article already exists by URL
          const { data: existingArticle } = await supabaseClient
            .from('news_articles')
            .select('id')
            .eq('url', result.url)
            .maybeSingle()

          if (existingArticle) {
            console.log(`Article already exists, skipping: ${result.title}`)
            continue
          }

          // Use Gemini AI for enhanced analysis
          const analysis = await analyzeWithGemini(
            result.title, 
            result.description, 
            `${result.title} ${result.description}`
          )
          
          // Extract publication date from result if available
          const publishedAt = extractPublishedDate(result)
          
          const { data: insertedArticle, error } = await supabaseClient
            .from('news_articles')
            .insert({
              title: result.title,
              content: analysis.summary || result.description,
              summary: analysis.summary,
              url: result.url,
              image_url: null,
              published_at: publishedAt,
              source: extractDomain(result.url),
              category: analysis.category || 'Market News',
              sentiment: analysis.sentiment,
              market_impact: analysis.marketImpact,
              companies: analysis.companies,
            })
            .select()
            .single()

          if (error) {
            console.error('Error inserting article:', error)
            continue
          }

          console.log(`Successfully processed: ${result.title}`)
          processedArticles.push(result.title)

          // Generate AI-powered impact analysis for the article
          if (insertedArticle) {
            console.log(`Generating impact analysis for: ${result.title}`)
            await generateImpactAnalysis(supabaseClient, insertedArticle, `${result.title} ${result.description}`)
          }
        }
      } catch (searchError) {
        console.error(`Error processing search query "${query}":`, searchError)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedArticles.length,
        articles: processedArticles,
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

async function generateImpactAnalysis(supabaseClient: any, article: any, fullText: string) {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, skipping impact analysis')
      return
    }

    const prompt = `Analyze this Indian stock market news for market impact and provide a JSON response:
    {
      "what_happened": "Brief summary of what happened (2-3 sentences)",
      "why_matters": "Why this matters for the Indian stock market (2-3 sentences)", 
      "market_impact_description": "Detailed market impact explanation (3-4 sentences)",
      "expected_points_impact": number (estimated Nifty 50 points impact, can be positive or negative, range -500 to +500),
      "confidence_score": number (confidence in analysis from 0-100)
    }

    News: ${fullText}

    Focus on Indian market context. Be specific about potential Nifty 50 impact. Respond only with valid JSON.`

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
          maxOutputTokens: 512,
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error for impact analysis:', response.status)
      return
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error('No generated text from Gemini for impact analysis')
      return
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini impact analysis response')
      return
    }

    const impactAnalysis = JSON.parse(jsonMatch[0])
    
    // Insert impact analysis into database
    const { data: insertedAnalysis, error: analysisError } = await supabaseClient
      .from('market_analysis')
      .insert({
        news_article_id: article.id,
        what_happened: impactAnalysis.what_happened,
        why_matters: impactAnalysis.why_matters,
        market_impact_description: impactAnalysis.market_impact_description,
        expected_points_impact: impactAnalysis.expected_points_impact || 0,
        confidence_score: impactAnalysis.confidence_score || 50
      })

    if (analysisError) {
      console.error('Error inserting impact analysis:', analysisError)
    } else {
      console.log(`Impact analysis generated for article: ${article.title}`)
    }

  } catch (error) {
    console.error('Error generating impact analysis:', error)
  }
}

function isRelevantNewsSource(url: string, title: string): boolean {
  const newsPatterns = [
    'economictimes.indiatimes.com',
    'business-standard.com',
    'livemint.com',
    'moneycontrol.com',
    'financialexpress.com',
    'zeebiz.com',
    'cnbctv18.com',
    'bloomberg.com',
    'reuters.com',
    'exchange4media.com',
    'goodreturns.in'
  ]
  
  const titleKeywords = ['stock market', 'nifty', 'sensex', 'bse', 'nse', 'shares', 'equity', 'trading']
  
  const isNewsSource = newsPatterns.some(pattern => url.toLowerCase().includes(pattern))
  const hasRelevantKeywords = titleKeywords.some(keyword => title.toLowerCase().includes(keyword))
  
  return isNewsSource || hasRelevantKeywords
}

function extractPublishedDate(result: any): string {
  if (result.age) {
    return new Date(Date.now() - (parseAge(result.age) * 1000)).toISOString()
  }
  
  return new Date().toISOString()
}

function parseAge(ageString: string): number {
  if (!ageString) return 0
  
  const parts = ageString.toLowerCase().split(' ')
  if (parts.length < 2) return 0
  
  const value = parseInt(parts[0]) || 0
  const unit = parts[1]
  
  if (unit.includes('minute')) return value * 60
  if (unit.includes('hour')) return value * 3600
  if (unit.includes('day')) return value * 86400
  if (unit.includes('week')) return value * 604800
  
  return 0
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
    return 'Unknown Source'
  }
}

async function analyzeWithGemini(title: string, description: string, content: string): Promise<{
  sentiment: string;
  marketImpact: string;
  companies: string[];
  summary: string;
  category: string;
}> {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, using fallback analysis')
      return fallbackAnalysis(title, description)
    }

    const text = `${title} ${description}`.trim()
    
    const prompt = `Analyze this Indian stock market news and provide a JSON response:
    {
      "sentiment": "positive|negative|neutral",
      "marketImpact": "high|medium|low", 
      "companies": ["company1", "company2"],
      "summary": "2-3 sentence summary focusing on market implications",
      "category": "Market News|Earnings|Policy|IPO|Merger|Other"
    }

    News: ${text}

    Focus on Indian market context. Extract Indian company names mentioned. Respond only with valid JSON.`

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
          maxOutputTokens: 512,
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return fallbackAnalysis(title, description)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error('No generated text from Gemini')
      return fallbackAnalysis(title, description)
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response')
      return fallbackAnalysis(title, description)
    }

    const analysis = JSON.parse(jsonMatch[0])
    console.log('Gemini analysis successful')
    
    return {
      sentiment: analysis.sentiment || 'neutral',
      marketImpact: analysis.marketImpact || 'low',
      companies: analysis.companies || [],
      summary: analysis.summary || description?.substring(0, 200) || title,
      category: analysis.category || 'Market News'
    }

  } catch (error) {
    console.error('Error with Gemini analysis:', error)
    return fallbackAnalysis(title, description)
  }
}

function fallbackAnalysis(title: string, description: string): {
  sentiment: string;
  marketImpact: string;
  companies: string[];
  summary: string;
  category: string;
} {
  const text = `${title} ${description}`.toLowerCase()
  
  return {
    sentiment: analyzeSentiment(text),
    marketImpact: analyzeMarketImpact(text),
    companies: extractCompanies(text),
    summary: description?.substring(0, 200) || title,
    category: 'Market News'
  }
}

function analyzeSentiment(text: string): string {
  const positiveWords = ['surge', 'gain', 'rise', 'bull', 'positive', 'growth', 'profit', 'strong', 'up', 'boost', 'rally']
  const negativeWords = ['fall', 'drop', 'bear', 'negative', 'loss', 'weak', 'decline', 'crash', 'down', 'slump', 'dip']
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length
  const negativeCount = negativeWords.filter(word => text.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function analyzeMarketImpact(text: string): string {
  const highImpactWords = ['nifty', 'sensex', 'rbi', 'policy', 'rate', 'crisis', 'merger', 'acquisition', 'ipo']
  const mediumImpactWords = ['earnings', 'results', 'quarterly', 'revenue', 'profit', 'loss']
  
  if (highImpactWords.some(word => text.includes(word))) return 'high'
  if (mediumImpactWords.some(word => text.includes(word))) return 'medium'
  return 'low'
}

function extractCompanies(text: string): string[] {
  const nifty50Companies = [
    'Reliance Industries', 'Tata Consultancy Services', 'HDFC Bank', 'Infosys', 'Hindustan Unilever',
    'ICICI Bank', 'Kotak Mahindra Bank', 'State Bank of India', 'Bharti Airtel', 'ITC',
    'Bajaj Finance', 'Wipro', 'Asian Paints', 'Maruti Suzuki', 'Larsen & Toubro',
    'Titan Company', 'Nestle India', 'UltraTech Cement', 'HCL Technologies', 'Axis Bank'
  ]
  
  return nifty50Companies.filter(company => 
    text.toLowerCase().includes(company.toLowerCase()) ||
    text.toLowerCase().includes(company.split(' ')[0].toLowerCase())
  )
}
