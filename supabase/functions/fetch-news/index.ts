
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log('Checking daily API usage...')
    
    // Check today's API usage to respect 60 searches/day limit
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabaseClient
      .from('api_usage')
      .select('search_count')
      .eq('date', today)
      .eq('api_name', 'brave_search')
      .single()

    const currentSearches = usageData?.search_count || 0
    const maxDailySearches = 55 // Keep buffer under 60

    if (currentSearches >= maxDailySearches) {
      console.log(`Daily limit reached: ${currentSearches}/${maxDailySearches}`)
      return new Response(
        JSON.stringify({ success: false, message: 'Daily API limit reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(`Current usage: ${currentSearches}/${maxDailySearches} searches`)
    
    const searchQueries = [
      'Nifty 50 India stock market news today',
      'BSE Sensex market news India',
      'NSE Indian stock market updates'
    ]

    const maxSearchesToday = Math.min(3, maxDailySearches - currentSearches)
    const processedArticles = []

    for (let i = 0; i < maxSearchesToday; i++) {
      const query = searchQueries[i]
      console.log(`Searching Brave for: ${query}`)
      
      const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pd`, {
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

      // Process search results
      for (const result of results.slice(0, 3)) { // Limit to 3 results per query
        if (!result.title || !result.url) continue

        console.log(`Processing article: ${result.title}`)

        // Check if article already exists
        const { data: existingArticle } = await supabaseClient
          .from('news_articles')
          .select('id')
          .eq('url', result.url)
          .single()

        if (existingArticle) {
          console.log(`Article already exists, skipping: ${result.title}`)
          continue
        }

        // Use Gemini AI for enhanced analysis
        const analysis = await analyzeWithGemini(
          result.title, 
          result.description || '', 
          result.title // Use title as content since we don't have full article
        )
        
        const { error } = await supabaseClient
          .from('news_articles')
          .insert({
            title: result.title,
            content: analysis.summary || result.description,
            summary: analysis.summary,
            url: result.url,
            image_url: null, // Brave Search doesn't provide images in basic results
            published_at: result.age ? new Date(Date.now() - (parseAge(result.age) * 1000)).toISOString() : new Date().toISOString(),
            source: extractDomain(result.url),
            category: analysis.category || 'Market News',
            sentiment: analysis.sentiment,
            market_impact: analysis.marketImpact,
            companies: analysis.companies,
          })

        if (error) {
          console.error('Error inserting article:', error)
        } else {
          console.log(`Successfully processed: ${result.title}`)
          processedArticles.push(result.title)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedArticles.length,
        searchesUsed: maxSearchesToday,
        remainingSearches: maxDailySearches - (currentSearches + maxSearchesToday)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})

function parseAge(ageString: string): number {
  // Parse age strings like "2 hours ago", "1 day ago", etc.
  if (!ageString) return 0
  
  const parts = ageString.toLowerCase().split(' ')
  if (parts.length < 2) return 0
  
  const value = parseInt(parts[0]) || 0
  const unit = parts[1]
  
  if (unit.includes('minute')) return value * 60
  if (unit.includes('hour')) return value * 3600
  if (unit.includes('day')) return value * 86400
  if (unit.includes('week')) return value * 604800
  
  return 0 // Default to current time if can't parse
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
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
      console.log('Gemini API key not found, falling back to simple analysis')
      return fallbackAnalysis(title, description)
    }

    const text = `${title} ${description} ${content}`.trim()
    
    const prompt = `Analyze this Indian stock market news article and provide a JSON response with the following structure:
    {
      "sentiment": "positive|negative|neutral",
      "marketImpact": "high|medium|low", 
      "companies": ["company1", "company2"],
      "summary": "Brief 2-3 sentence summary",
      "category": "Market News|Earnings|Policy|IPO|Merger|Other"
    }

    Article: ${text}

    Focus on:
    - Sentiment: How this news affects market sentiment (positive/negative/neutral)
    - Market Impact: Potential impact on Indian markets (high/medium/low)
    - Companies: Extract any Indian company names mentioned (use full company names)
    - Summary: Concise summary focusing on market implications
    - Category: Classify the type of news

    Respond only with valid JSON.`

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
      console.error('Gemini API error:', response.status, await response.text())
      return fallbackAnalysis(title, description)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      console.error('No generated text from Gemini')
      return fallbackAnalysis(title, description)
    }

    // Clean up the response to extract JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response')
      return fallbackAnalysis(title, description)
    }

    const analysis = JSON.parse(jsonMatch[0])
    console.log('Gemini analysis:', analysis)
    
    return {
      sentiment: analysis.sentiment || 'neutral',
      marketImpact: analysis.marketImpact || 'low',
      companies: analysis.companies || extractCompanies(text),
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
  
  const sentiment = analyzeSentiment(text)
  const marketImpact = analyzeMarketImpact(text)
  const companies = extractCompanies(text)
  
  return {
    sentiment,
    marketImpact,
    companies,
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
    'Titan Company', 'Nestle India', 'UltraTech Cement', 'HCL Technologies', 'Axis Bank',
    'Mahindra & Mahindra', 'Bajaj Finserv', 'Tech Mahindra', 'Sun Pharmaceutical', 'Power Grid Corporation',
    'NTPC', 'Tata Steel', 'IndusInd Bank', 'Adani Ports', 'JSW Steel'
  ]
  
  return nifty50Companies.filter(company => 
    text.toLowerCase().includes(company.toLowerCase()) ||
    text.toLowerCase().includes(company.split(' ')[0].toLowerCase())
  )
}
