
export class GeminiAnalysisService {
  private geminiApiKey: string

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey
  }

  // ENHANCEMENT: Analyze event and return AI quality score and enrichment
  async analyzeEventWithQualityScore(event: any) {
    // Compose prompt for Gemini (score quality, enrich content)
    const prompt = `
      Event Title: ${event.title}
      Description: ${event.description}

      1. Rate the news event quality from 0.0 (bad/dummy) to 1.0 (very relevant, recent, market specific).
      2. Output a JSON object with:
      {
        "title": "...",
        "ai_enhanced_analysis": "...",
        "market_implications": "...",
        "quality_score": <float between 0.0 and 1.0>,
        "event_type": "...",
        "confidence": <number>,
        "source": "...",
        "url": "${event.url || ''}",
        "description": "${event.description?.replace(/"/g, "'") || ''}"
      }
      Short, financial domain-specific, Indian market only. DO NOT RETURN placeholder, fallback, or demo values.
    `;
    try {
      const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + this.geminiApiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })
      const result = await resp.json()
      // Attempt to parse Gemini structured output
      let parsed = null
      if (
        result.candidates?.length &&
        result.candidates[0]?.content?.parts?.length
      ) {
        try {
          const text = result.candidates[0].content.parts[0].text
          parsed = JSON.parse(text)
        } catch (e) {
          // Fallback: extract relevant content fields manually if needed
          parsed = {
            title: event.title,
            ai_enhanced_analysis: event.description,
            market_implications: "",
            quality_score: 0.5,
            event_type: event.event_type || 'Market News',
            confidence: event.confidence || 70,
            source: event.source,
            url: event.url || '',
            description: event.description,
          }
        }
      }
      return parsed
    } catch (e) {
      console.error("Gemini API error", e)
      return null
    }
  }
}
