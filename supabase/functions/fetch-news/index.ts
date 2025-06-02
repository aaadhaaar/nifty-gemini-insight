
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

    console.log('Fetching news from NewsAPI...')
    
    // Fetch news from the API
    const newsResponse = await fetch('https://newsapi.org/v2/everything?q=Nifty%2050%20OR%20BSE%20OR%20NSE%20OR%20Indian%20stock%20market&language=en&sortBy=publishedAt&pageSize=20', {
      headers: {
        'X-API-Key': Deno.env.get('NEWS_API_KEY') ?? '',
      },
    })

    if (!newsResponse.ok) {
      throw new Error(`News API error: ${newsResponse.status}`)
    }

    const newsData = await newsResponse.json()
    const articles = newsData.articles || []
    console.log(`Processing ${articles.length} articles...`)

    // Process and store articles
    for (const article of articles) {
      if (!article.title || !article.publishedAt) continue

      console.log(`Analyzing article: ${article.title}`)

      // Use Gemini AI for enhanced analysis
      const analysis = await analyzeWithGemini(article.title, article.description || '', article.content || '')
      
      const { error } = await supabaseClient
        .from('news_articles')
        .upsert({
          title: article.title,
          content: analysis.summary || article.description,
          summary: analysis.summary,
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source: article.source?.name,
          category: analysis.category || 'Market News',
          sentiment: analysis.sentiment,
          market_impact: analysis.marketImpact,
          companies: analysis.companies,
        }, {
          onConflict: 'url',
          ignoreDuplicates: true
        })

      if (error) {
        console.error('Error inserting article:', error)
      } else {
        console.log(`Successfully processed: ${article.title}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: articles.length }),
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
