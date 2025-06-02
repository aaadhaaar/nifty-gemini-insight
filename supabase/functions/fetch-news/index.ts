
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

    // Process and store articles
    for (const article of articles) {
      if (!article.title || !article.publishedAt) continue

      // Simple sentiment analysis based on keywords
      const sentiment = analyzeSentiment(article.title + ' ' + (article.description || ''))
      const marketImpact = analyzeMarketImpact(article.title + ' ' + (article.description || ''))
      const companies = extractCompanies(article.title + ' ' + (article.description || ''))

      const { error } = await supabaseClient
        .from('news_articles')
        .upsert({
          title: article.title,
          content: article.description,
          summary: article.description?.substring(0, 200),
          url: article.url,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          source: article.source?.name,
          category: 'Market News',
          sentiment,
          market_impact: marketImpact,
          companies,
        }, {
          onConflict: 'url',
          ignoreDuplicates: true
        })

      if (error) {
        console.error('Error inserting article:', error)
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

function analyzeSentiment(text: string): string {
  const positiveWords = ['surge', 'gain', 'rise', 'bull', 'positive', 'growth', 'profit', 'strong']
  const negativeWords = ['fall', 'drop', 'bear', 'negative', 'loss', 'weak', 'decline', 'crash']
  
  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

function analyzeMarketImpact(text: string): string {
  const highImpactWords = ['nifty', 'sensex', 'rbi', 'policy', 'rate', 'crisis', 'merger']
  const mediumImpactWords = ['earnings', 'results', 'quarterly', 'revenue', 'profit']
  
  const lowerText = text.toLowerCase()
  
  if (highImpactWords.some(word => lowerText.includes(word))) return 'high'
  if (mediumImpactWords.some(word => lowerText.includes(word))) return 'medium'
  return 'low'
}

function extractCompanies(text: string): string[] {
  const nifty50Companies = [
    'Reliance', 'TCS', 'HDFC', 'Infosys', 'ICICI', 'Hindustan Unilever', 'ITC', 'SBI',
    'Bharti Airtel', 'Bajaj Finance', 'Kotak Mahindra', 'Wipro', 'Asian Paints', 'Maruti',
    'Larsen & Toubro', 'Titan', 'Nestle', 'UltraTech', 'HCL Tech', 'Axis Bank'
  ]
  
  return nifty50Companies.filter(company => 
    text.toLowerCase().includes(company.toLowerCase())
  )
}
