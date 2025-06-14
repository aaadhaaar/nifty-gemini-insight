
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

    const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY')
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!braveApiKey || !geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Fetching live technical analysis data...')

    // Search for current technical analysis and market data
    const technicalQueries = [
      'Nifty 50 technical analysis today RSI MACD moving averages support resistance',
      'Indian stock market technical indicators chart patterns today analysis',
      'Nifty Sensex technical levels support resistance breakout patterns today'
    ]

    const allTechnicalData = []

    for (const query of technicalQueries) {
      try {
        const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&freshness=pd&country=IN&search_lang=en&result_filter=web&extra_snippets=true`, {
          headers: {
            'X-Subscription-Token': braveApiKey,
            'Accept': 'application/json',
          },
        })

        if (braveResponse.ok) {
          const searchData = await braveResponse.json()
          const results = searchData.web?.results || []
          
          for (const result of results.slice(0, 3)) {
            if (result.title && result.description) {
              allTechnicalData.push({
                title: result.title,
                description: result.description,
                source: result.url || 'Unknown'
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for ${query}:`, error)
      }
    }

    if (allTechnicalData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No technical data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Combine all technical data for AI analysis
    const combinedData = allTechnicalData.map(item => 
      `Title: ${item.title}\nContent: ${item.description}\nSource: ${item.source}`
    ).join('\n\n---\n\n')

    const prompt = `Analyze this current Indian market technical data and provide comprehensive technical analysis. Focus on Nifty 50 index:

Technical Data:
${combinedData}

Generate analysis in this exact JSON format:
{
  "market_overview": {
    "nifty_level": "current estimated level (number)",
    "resistance": "key resistance level (number)", 
    "support": "key support level (number)",
    "overall_trend": "bullish|bearish|neutral"
  },
  "technical_indicators": [
    {
      "name": "indicator name",
      "value": "current value or status",
      "signal": "bullish|bearish|neutral",
      "description": "brief explanation"
    }
  ],
  "key_levels": [
    {
      "level": "price level (number)",
      "type": "resistance|support", 
      "strength": "strong|moderate|weak"
    }
  ],
  "chart_patterns": [
    {
      "name": "pattern name",
      "timeframe": "timeframe",
      "probability": "confidence percentage (number)",
      "target": "price target (number)"
    }
  ]
}

Provide realistic values based on current Nifty 50 levels. Include 3-4 indicators, 4-5 key levels, and 2-3 chart patterns. Respond only with valid JSON.`

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
          topP: 0.9,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'No AI response generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const technicalAnalysis = JSON.parse(jsonMatch[0])

    // Store the analysis in database for caching
    await supabaseClient
      .from('technical_analysis')
      .upsert({
        analysis_date: new Date().toISOString().split('T')[0],
        market_overview: technicalAnalysis.market_overview,
        technical_indicators: technicalAnalysis.technical_indicators,
        key_levels: technicalAnalysis.key_levels,
        chart_patterns: technicalAnalysis.chart_patterns,
        data_sources: allTechnicalData.length
      })

    console.log('Technical analysis completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: technicalAnalysis,
        sources_analyzed: allTechnicalData.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in technical-analysis function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
