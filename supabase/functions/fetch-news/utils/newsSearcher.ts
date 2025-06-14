
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
  time_relevance?: number
}

export class NewsSearcher {
  private braveApiKey: string

  constructor(braveApiKey: string) {
    this.braveApiKey = braveApiKey
  }

  // High-priority queries for market open/close periods
  getHighPriorityQueries(): string[] {
    return [
      'Indian stock market Nifty Sensex opening closing today live RBI policy breaking news',
      'India market movers top gainers losers today earnings results corporate action',
      'Indian rupee USD forex crude oil gold commodity prices live market impact today'
    ]
  }

  // Pre-market queries focusing on overnight developments
  getPreMarketQueries(): string[] {
    return [
      'Indian market pre-market global cues overnight news RBI policy US Fed impact',
      'India stock market opening predictions Asian markets overnight corporate results today'
    ]
  }

  // Post-market queries focusing on analysis and results
  getPostMarketQueries(): string[] {
    return [
      'Indian stock market closing analysis Nifty Sensex performance today results review',
      'India market wrap earnings results corporate announcements post market analysis today'
    ]
  }

  // Standard optimized queries for regular market hours
  getOptimizedMarketEventQueries(): string[] {
    return [
      'Indian stock market Nifty Sensex latest news today RBI policy earnings impact live'
    ]
  }

  async searchMarketEvents(query: string, intensity: string = 'standard'): Promise<MarketEvent[]> {
    console.log(`Strategic market search - ${intensity} intensity: ${query}`)
    
    try {
      // Adjust search parameters based on intensity
      const searchCount = intensity === 'high' ? 12 : intensity === 'pre-market' || intensity === 'post-market' ? 8 : 6
      const freshness = this.getFreshnessParam(intensity)
      
      const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${searchCount}&freshness=${freshness}&country=IN&search_lang=en&result_filter=web&extra_snippets=true&summary=true`, {
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
      
      console.log(`Strategic search yielded ${results.length} results with AI summary (${intensity} intensity)`)

      const marketEvents: MarketEvent[] = []

      // Enhanced AI summary processing for different intensities
      if (aiSummary && aiSummary.length > 50) {
        const timeRelevance = this.calculateTimeRelevance(intensity)
        marketEvents.push({
          title: `Market Intelligence: ${this.extractEventTitle(query, intensity)}`,
          description: aiSummary,
          ai_summary: aiSummary,
          market_implications: this.generateMarketImplications(aiSummary, intensity),
          source: 'AI Strategic Analysis',
          timestamp: new Date().toISOString(),
          freshness_score: 100,
          event_type: this.categorizeEvent(query),
          confidence: this.calculateConfidence(intensity, aiSummary),
          time_relevance: timeRelevance
        })
      }

      // Process more results for high-intensity periods
      const resultLimit = intensity === 'high' ? 6 : intensity === 'pre-market' || intensity === 'post-market' ? 4 : 3
      for (const result of results.slice(0, resultLimit)) {
        if (!result.title || !result.description) continue

        if (isRelevantMarketNews(result.title, result.description)) {
          const freshnessScore = calculateFreshnessScore(result.title, result.description)
          const timeRelevance = this.calculateTimeRelevance(intensity)
          
          if (freshnessScore > 35) { // Slightly lower threshold for high-intensity periods
            marketEvents.push({
              title: result.title,
              description: result.description,
              ai_summary: this.generateAiSummary(result.title, result.description, intensity),
              market_implications: this.generateMarketImplications(result.description, intensity),
              source: extractDomain(result.url || ''),
              timestamp: new Date().toISOString(),
              freshness_score: freshnessScore,
              event_type: this.categorizeEvent(result.title + ' ' + result.description),
              confidence: Math.min(95, freshnessScore + (intensity === 'high' ? 20 : 15)),
              time_relevance: timeRelevance
            })
          }
        }
      }

      return marketEvents.sort((a, b) => {
        const scoreA = (a.freshness_score + (a.time_relevance || 0)) * (a.confidence / 100)
        const scoreB = (b.freshness_score + (b.time_relevance || 0)) * (b.confidence / 100)
        return scoreB - scoreA
      })
    } catch (error) {
      console.error(`Error in strategic market search "${query}" (${intensity}):`, error)
      return []
    }
  }

  private getFreshnessParam(intensity: string): string {
    switch (intensity) {
      case 'high': return 'pd' // Past day for critical periods
      case 'pre-market': return 'pd' // Past day for overnight developments
      case 'post-market': return 'pd' // Past day for closing analysis
      default: return 'pd' // Past day for standard
    }
  }

  private calculateTimeRelevance(intensity: string): number {
    const hour = new Date().getHours()
    let baseRelevance = 0
    
    switch (intensity) {
      case 'high':
        baseRelevance = 25
        break
      case 'pre-market':
        baseRelevance = 20
        break
      case 'post-market':
        baseRelevance = 15
        break
      default:
        baseRelevance = 10
    }
    
    // Boost relevance during market hours
    if (hour >= 9 && hour <= 16) {
      baseRelevance += 10
    }
    
    return baseRelevance
  }

  private calculateConfidence(intensity: string, content: string): number {
    let baseConfidence = 85
    
    // Boost confidence for high-intensity searches
    if (intensity === 'high') baseConfidence += 5
    if (intensity === 'pre-market' || intensity === 'post-market') baseConfidence += 3
    
    // Boost for comprehensive content
    if (content.length > 200) baseConfidence += 5
    
    return Math.min(95, baseConfidence)
  }

  private extractEventTitle(query: string, intensity: string): string {
    const prefix = intensity === 'high' ? 'Critical ' : intensity === 'pre-market' ? 'Pre-Market ' : intensity === 'post-market' ? 'Post-Market ' : ''
    
    if (query.includes('RBI')) return prefix + 'RBI Policy Impact'
    if (query.includes('opening') || query.includes('closing')) return prefix + 'Market Session Analysis'
    if (query.includes('earnings') || query.includes('results')) return prefix + 'Corporate Updates'
    if (query.includes('rupee') || query.includes('forex')) return prefix + 'Currency & Forex'
    if (query.includes('global') || query.includes('overnight')) return prefix + 'Global Market Cues'
    return prefix + 'Market Intelligence'
  }

  private generateAiSummary(title: string, description: string, intensity: string): string {
    const content = title + ' ' + description
    const prefix = intensity === 'high' ? '[CRITICAL] ' : intensity === 'pre-market' ? '[PRE-MARKET] ' : intensity === 'post-market' ? '[POST-MARKET] ' : ''
    
    // Extract key points with intensity-based focus
    const keyWords = ['profit', 'loss', 'growth', 'decline', 'surge', 'crash', 'rally', 'fall', 'beat', 'miss', 'upgrade', 'downgrade', 'buy', 'sell', 'target']
    const foundKeywords = keyWords.filter(word => content.toLowerCase().includes(word))
    
    if (foundKeywords.length > 0) {
      return `${prefix}Market event: ${foundKeywords.slice(0, 3).join(', ')}. ${description.substring(0, 140)}...`
    }
    
    return `${prefix}${description.substring(0, 160)}...`
  }

  private generateMarketImplications(content: string, intensity: string): string {
    const lowerContent = content.toLowerCase()
    const urgencyPrefix = intensity === 'high' ? 'IMMEDIATE IMPACT: ' : intensity === 'pre-market' ? 'PRE-MARKET ALERT: ' : intensity === 'post-market' ? 'CLOSING ANALYSIS: ' : ''
    
    if (lowerContent.includes('rate') && (lowerContent.includes('cut') || lowerContent.includes('reduce'))) {
      return urgencyPrefix + 'Rate cut signals positive liquidity boost for growth sectors and market sentiment'
    }
    if (lowerContent.includes('rate') && (lowerContent.includes('hike') || lowerContent.includes('increase'))) {
      return urgencyPrefix + 'Rate hike creates headwinds for growth stocks, potential sector rotation to defensives'
    }
    if (lowerContent.includes('earnings') && (lowerContent.includes('beat') || lowerContent.includes('surge'))) {
      return urgencyPrefix + 'Strong earnings beat likely to drive sector momentum and positive sentiment'
    }
    if (lowerContent.includes('earnings') && (lowerContent.includes('miss') || lowerContent.includes('fall'))) {
      return urgencyPrefix + 'Earnings miss may trigger sector-wide correction and cautious sentiment'
    }
    if (lowerContent.includes('fii') || lowerContent.includes('foreign')) {
      return urgencyPrefix + 'Foreign investment flow changes impact market liquidity and index movement'
    }
    if (lowerContent.includes('global') || lowerContent.includes('overnight')) {
      return urgencyPrefix + 'Global developments influence opening sentiment and intraday direction'
    }
    
    return urgencyPrefix + 'Market development requires monitoring for directional impact and sector implications'
  }

  private categorizeEvent(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('rbi') || lowerContent.includes('monetary') || lowerContent.includes('rate')) {
      return 'Monetary Policy'
    }
    if (lowerContent.includes('earnings') || lowerContent.includes('results') || lowerContent.includes('beat') || lowerContent.includes('miss')) {
      return 'Corporate Earnings'
    }
    if (lowerContent.includes('fii') || lowerContent.includes('dii') || lowerContent.includes('investment') || lowerContent.includes('flow')) {
      return 'Investment Flows'
    }
    if (lowerContent.includes('global') || lowerContent.includes('overnight') || lowerContent.includes('us') || lowerContent.includes('china')) {
      return 'Global Markets'
    }
    if (lowerContent.includes('rupee') || lowerContent.includes('forex') || lowerContent.includes('dollar')) {
      return 'Currency & Forex'
    }
    if (lowerContent.includes('oil') || lowerContent.includes('gold') || lowerContent.includes('commodity')) {
      return 'Commodities'
    }
    if (lowerContent.includes('opening') || lowerContent.includes('closing') || lowerContent.includes('session')) {
      return 'Market Session'
    }
    
    return 'Market Events'
  }
}
