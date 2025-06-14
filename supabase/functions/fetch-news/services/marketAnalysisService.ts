
export async function generateMarketAnalysis(supabaseClient: any, marketEvents: any[]): Promise<void> {
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.log('Gemini API key not found, skipping enhanced market analysis')
      return
    }

    // Optimize for free tier: Process fewer events in a single batch
    const batchSize = 5 // Reduced from 3 to process more events per call
    const maxBatches = 1 // Limit to 1 batch per function call for free tier
    
    for (let i = 0; i < Math.min(marketEvents.length, batchSize * maxBatches); i += batchSize) {
      const eventBatch = marketEvents.slice(i, i + batchSize)
      const eventsText = eventBatch.map(event => 
        `Event: ${event.title}\nDescription: ${event.description}\nImplications: ${event.market_implications}\nType: ${event.event_type}\nConfidence: ${event.confidence}%`
      ).join('\n\n---\n\n')

      const prompt = `Analyze these Indian market events and provide comprehensive insights for investors. Focus on actionable insights and specific market implications:

Market Events:
${eventsText}

Generate analysis in this exact JSON format:
{
  "market_insights": [
    {
      "what_happened": "Clear, specific description of the market event or development",
      "why_matters": "Detailed explanation of impact on investors and market participants",
      "market_impact_description": "Specific assessment on market segments, sectors, or sentiment",
      "expected_points_impact": "numeric value between -2 and 2 for Nifty direction",
      "confidence_score": "numeric value between 70 and 95"
    }
  ],
  "overall_sentiment": "positive|negative|neutral",
  "key_themes": ["theme1", "theme2", "theme3"],
  "investor_action": "actionable insight for investors"
}

Create maximum 3 insights focusing on most impactful events. Be specific about Indian market context. Respond only with valid JSON.`

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
            temperature: 0.1, // Lower temperature for more consistent results
            topK: 1,
            topP: 0.9,
            maxOutputTokens: 800, // Reduced from 1024 for free tier optimization
          }
        })
      })

      if (!response.ok) {
        console.error('Gemini API error for optimized market analysis:', response.status)
        continue
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        console.error('No generated text from Gemini for optimized market analysis')
        continue
      }

      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in Gemini optimized market analysis response')
        continue
      }

      const analysis = JSON.parse(jsonMatch[0])
      
      // Insert optimized market analysis insights
      if (analysis.market_insights && Array.isArray(analysis.market_insights)) {
        for (const insight of analysis.market_insights.slice(0, 2)) { // Reduced from 3 to 2
          await supabaseClient
            .from('market_analysis')
            .insert({
              what_happened: insight.what_happened || 'Market development',
              why_matters: insight.why_matters || 'Market impact analysis',
              market_impact_description: insight.market_impact_description || 'Market assessment',
              expected_points_impact: Math.max(-2, Math.min(2, insight.expected_points_impact || 0)),
              confidence_score: Math.max(70, Math.min(95, insight.confidence_score || 80))
            })
        }
      }

      // Only process one batch for free tier optimization
      break
    }

    console.log('Optimized market analysis completed successfully for free tier')

  } catch (error) {
    console.error('Error generating optimized market analysis:', error)
  }
}
