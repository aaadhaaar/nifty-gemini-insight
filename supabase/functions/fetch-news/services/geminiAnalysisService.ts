
export class GeminiAnalysisService {
  private geminiApiKey: string

  constructor(geminiApiKey: string) {
    this.geminiApiKey = geminiApiKey
  }

  async analyzeMarketEvents(marketEvents: any[]): Promise<any[]> {
    if (!this.geminiApiKey) {
      console.log('No Gemini API key available, skipping AI analysis')
      return marketEvents
    }

    const analyzedEvents = []

    for (const event of marketEvents.slice(0, 5)) { // Analyze top 5 events
      try {
        const analysis = await this.getGeminiAnalysis(event)
        analyzedEvents.push({
          ...event,
          ai_enhanced_analysis: analysis.enhanced_analysis,
          market_implications: analysis.market_implications,
          confidence: Math.min(98, event.confidence + 5) // Boost confidence for AI-analyzed events
        })
      } catch (error) {
        console.error('Gemini analysis error:', error)
        analyzedEvents.push(event) // Keep original if analysis fails
      }
    }

    return analyzedEvents
  }

  private async getGeminiAnalysis(event: any): Promise<{enhanced_analysis: string, market_implications: string}> {
    const prompt = `Analyze this Indian market event and provide strategic insights:

Title: ${event.title}
Description: ${event.description}
Event Type: ${event.event_type}

Please provide:
1. Enhanced Analysis (2-3 sentences): Deep market context and significance
2. Market Implications (2-3 sentences): Specific trading/investment insights for Indian markets

Focus on actionable intelligence for Indian equity markets, sectors, and trading opportunities.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.geminiApiKey}`, {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Parse the response to extract analysis and implications
    const lines = content.split('\n').filter(line => line.trim())
    const enhanced_analysis = lines.find(line => line.includes('Enhanced Analysis') || line.includes('Analysis'))?.replace(/.*?:\s*/, '') || 
                            content.substring(0, 200) + '...'
    const market_implications = lines.find(line => line.includes('Market Implications') || line.includes('Implications'))?.replace(/.*?:\s*/, '') || 
                              'Strategic positioning opportunity identified in Indian markets with enhanced risk-reward profile'

    return {
      enhanced_analysis,
      market_implications
    }
  }
}
