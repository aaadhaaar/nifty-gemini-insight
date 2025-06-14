
import { isRelevantMarketNews, calculateFreshnessScore, extractDomain } from './newsFilters.ts'

export interface MarketEvent {
  title: string
  description: string
  ai_summary: string
  market_implications: string
  source: string
  timestamp: string
  freshness_score: number
  event_type: string
  confidence: number
}

export class NewsSearcher {
  private braveApiKey: string

  constructor(braveApiKey: string) {
    this.braveApiKey = braveApiKey
  }

  getMarketEventQueries(): string[] {
    return [
      'latest Indian stock market events today market moving news analysis',
      'RBI monetary policy rate decision impact market analysis today',
      'Nifty Sensex market events breaking news impact analysis',
      'Indian IPO FII DII investment flows market impact today',
      'Indian rupee forex crude oil market events analysis',
      'SEBI regulations Indian market policy changes impact',
      'Indian corporate earnings results market reaction analysis',
      'startup funding unicorn Indian market events analysis'
    ]
  }

  // Optimized queries for free tier - more focused and efficient
  getOptimizedMarketEventQueries(): string[] {
    return [
      'Indian stock market Nifty Sensex latest news today RBI policy earnings impact',
      'India IPO FII investment rupee forex crude oil market news analysis today'
    ]
  }

  async searchMarketEvents(query: string): Promise<MarketEvent[]> {
    console.log(`Searching for market events with optimized AI analysis: ${query}`)
    
    try {
      // Use Brave Search with optimized parameters for free tier
      const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&freshness=pd&country=IN&search_lang=en&result_filter=web&extra_snippets=true&summary=true`, {
        headers: {
          'X-Subscription-Token': this.braveApiKey,
          'Accept': 'application/json',
        },
      })

      if (!braveResponse.ok) {
        console.error(`Brave Search API error: ${braveResponse.status}`)
        return []
      }

      const searchData = await braveResponse.json()
      const results = searchData.web?.results || []
      const aiSummary = searchData.summarizer?.summary || ''
      
      console.log(`Found ${results.length} results with AI summary for optimized market events`)

      const marketEvents: MarketEvent[] = []

      // Process AI summary if available - prioritize this for free tier efficiency
      if (aiSummary && aiSummary.length > 50) {
        marketEvents.push({
          title: `Market Intelligence: ${this.extractEventTitle(query)}`,
          description: aiSummary,
          ai_summary: aiSummary,
          market_implications: this.generateMarketImplications(aiSummary),
          source: 'AI Market Analysis',
          timestamp: new Date().toISOString(),
          freshness_score: 100,
          event_type: this.categorizeEvent(query),
          confidence: 90
        })
      }

      // Process fewer search results for efficiency (reduced from 5 to 3)
      for (const result of results.slice(0, 3)) {
        if (!result.title || !result.description) continue

        if (isRelevantMarketNews(result.title, result.description)) {
          const freshnessScore = calculateFreshnessScore(result.title, result.description)
          
          if (freshnessScore > 40) { // Slightly higher threshold for quality
            marketEvents.push({
              title: result.title,
              description: result.description,
              ai_summary: this.generateAiSummary(result.title, result.description),
              market_implications: this.generateMarketImplications(result.description),
              source: extractDomain(result.url || ''),
              timestamp: new Date().toISOString(),
              freshness_score: freshnessScore,
              event_type: this.categorizeEvent(result.title + ' ' + result.description),
              confidence: Math.min(95, freshnessScore + 15)
            })
          }
        }
      }

      return marketEvents.sort((a, b) => b.freshness_score - a.freshness_score)
    } catch (error) {
      console.error(`Error processing optimized market events query "${query}":`, error)
      return []
    }
  }

  private extractEventTitle(query: string): string {
    if (query.includes('RBI')) return 'RBI Policy Developments'
    if (query.includes('IPO')) return 'IPO Market Activity'
    if (query.includes('Nifty') || query.includes('Sensex')) return 'Index Market Movements'
    if (query.includes('rupee') || query.includes('forex')) return 'Currency & Forex Events'
    if (query.includes('earnings')) return 'Corporate Earnings Updates'
    if (query.includes('SEBI')) return 'Regulatory Developments'
    if (query.includes('startup') || query.includes('funding')) return 'Startup & Investment Activity'
    return 'Market Events Analysis'
  }

  private generateAiSummary(title: string, description: string): string {
    const content = title + ' ' + description
    
    // Extract key points
    const keyWords = ['profit', 'loss', 'growth', 'decline', 'increase', 'decrease', 'launch', 'merger', 'acquisition', 'policy', 'rate', 'investment']
    const foundKeywords = keyWords.filter(word => content.toLowerCase().includes(word))
    
    if (foundKeywords.length > 0) {
      return `Market event involving ${foundKeywords.join(', ')}. ${description.substring(0, 150)}...`
    }
    
    return description.substring(0, 180) + '...'
  }

  private generateMarketImplications(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('rate') && (lowerContent.includes('cut') || lowerContent.includes('reduce'))) {
      return 'Potential positive impact on market liquidity and growth sectors'
    }
    if (lowerContent.includes('rate') && (lowerContent.includes('hike') || lowerContent.includes('increase'))) {
      return 'May create headwinds for growth stocks and increase borrowing costs'
    }
    if (lowerContent.includes('ipo') || lowerContent.includes('listing')) {
      return 'New investment opportunities and market expansion signals'
    }
    if (lowerContent.includes('fii') || lowerContent.includes('foreign')) {
      return 'Foreign investment flows may impact market sentiment and currency'
    }
    if (lowerContent.includes('earnings') && lowerContent.includes('beat')) {
      return 'Strong earnings performance may boost sector confidence'
    }
    if (lowerContent.includes('regulation') || lowerContent.includes('sebi')) {
      return 'Regulatory changes may reshape market structure and compliance'
    }
    
    return 'Market impact depends on broader economic context and investor sentiment'
  }

  private categorizeEvent(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('rbi') || lowerContent.includes('monetary') || lowerContent.includes('rate')) {
      return 'Monetary Policy'
    }
    if (lowerContent.includes('ipo') || lowerContent.includes('listing')) {
      return 'IPO & Listings'
    }
    if (lowerContent.includes('earnings') || lowerContent.includes('results')) {
      return 'Corporate Earnings'
    }
    if (lowerContent.includes('fii') || lowerContent.includes('dii') || lowerContent.includes('investment')) {
      return 'Investment Flows'
    }
    if (lowerContent.includes('sebi') || lowerContent.includes('regulation')) {
      return 'Regulatory'
    }
    if (lowerContent.includes('rupee') || lowerContent.includes('forex')) {
      return 'Currency & Forex'
    }
    if (lowerContent.includes('startup') || lowerContent.includes('funding')) {
      return 'Startup Ecosystem'
    }
    
    return 'Market Events'
  }
}
