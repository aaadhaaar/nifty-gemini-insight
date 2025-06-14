
export async function generateMarketAnalysis(supabaseClient: any, marketEvents: any[]): Promise<void> {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, skipping enhanced market analysis')
      return
    }

    // Process events in batches for deeper analysis
    const batchSize = 3
    for (let i = 0; i < marketEvents.length; i += batchSize) {
      const eventBatch = marketEvents.slice(i, i + batchSize)
      const eventsText = eventBatch.map(event => 
        `Event: ${event.title}\nDescription: ${event.description}\nImplications: ${event.market_implications}\nType: ${event.event_type}\nConfidence: ${event.confidence}%`
      ).join('\n\n---\n\n')

      const prompt = `Analyze these market events and provide comprehensive insights for Indian stock market investors:

Market Events:
${eventsText}

Generate analysis in this exact JSON format:
{
  "market_insights": [
    {
      "what_happened": "Clear description of the market event or development",
      "why_matters": "Detailed explanation of why this matters to investors and market participants",
      "market_impact_description": "Specific impact assessment on market segments, sectors, or overall sentiment",
      "expected_points_impact": "numeric value between -2 and 2 representing expected Nifty points impact direction",
      "confidence_score": "numeric value between 60 and 95 representing confidence in the analysis"
    }
  ],
  "overall_sentiment": "positive|negative|neutral",
  "key_themes": ["theme1", "theme2", "theme3"],
  "investor_action": "brief actionable insight for investors"
}

Focus on creating actionable insights that help investors understand market implications. Consider sector impacts, timing, and broader economic context. Respond only with valid JSON.`

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
            temperature: 0.2,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        console.error('Gemini API error for enhanced market analysis:', response.status)
        continue
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        console.error('No generated text from Gemini for enhanced market analysis')
        continue
      }

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in Gemini enhanced market analysis response')
        continue
      }

      const analysis = JSON.parse(jsonMatch[0])
      
      // Insert enhanced market analysis insights
      if (analysis.market_insights && Array.isArray(analysis.market_insights)) {
        for (const insight of analysis.market_insights.slice(0, 3)) {
          await supabaseClient
            .from('market_analysis')
            .insert({
              what_happened: insight.what_happened || 'Market development',
              why_matters: insight.why_matters || 'Market impact analysis',
              market_impact_description: insight.market_impact_description || 'Market assessment',
              expected_points_impact: Math.max(-2, Math.min(2, insight.expected_points_impact || 0)),
              confidence_score: Math.max(60, Math.min(95, insight.confidence_score || 75))
            })
        }
      }
    }

    console.log('Enhanced market analysis completed successfully')

  } catch (error) {
    console.error('Error generating enhanced market analysis:', error)
  }
}
