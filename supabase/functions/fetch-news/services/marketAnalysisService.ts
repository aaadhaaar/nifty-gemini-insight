
export async function generateMarketAnalysis(supabaseClient: any, marketNews: any[]): Promise<void> {
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
