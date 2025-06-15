
export class RealTimeMarketService {
  private braveApiKey: string
  private geminiApiKey: string

  constructor(braveApiKey: string, geminiApiKey: string) {
    this.braveApiKey = braveApiKey
    this.geminiApiKey = geminiApiKey
  }

  async getCurrentMarketEvents(): Promise<any[]> {
    console.log('Fetching real-time Indian market events...')
    
    const queries = [
      'NSE BSE Indian stock market live updates today news',
      'Nifty Sensex market movement today analysis',
      'Indian stock market breaking news live updates',
      'RBI monetary policy Indian market impact today',
      'FII DII investment flows Indian stocks today'
    ]

    const allEvents = []

    for (const query of queries.slice(0, 2)) { // Limit to 2 queries to avoid rate limits
      try {
        const events = await this.searchMarketEvents(query)
        allEvents.push(...events)
        
        // Small delay between searches
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error searching for "${query}":`, error)
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueEvents = this.removeDuplicates(allEvents)
    return uniqueEvents.slice(0, 8) // Return top 8 events
  }

  private async searchMarketEvents(query: string): Promise<any[]> {
    try {
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10&freshness=pd&country=IN&search_lang=en`, {
        headers: {
          'X-Subscription-Token': this.braveApiKey,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`Brave Search API error: ${response.status}`)
        return []
      }

      const data = await response.json()
      const results = data.web?.results || []

      return results.map((result: any) => ({
        title: result.title,
        description: result.description,
        url: result.url,
        source: this.extractDomain(result.url),
        timestamp: new Date().toISOString(),
        freshness_score: this.calculateFreshness(result.title, result.description),
        event_type: this.categorizeEvent(result.title + ' ' + result.description),
        confidence: 85
      })).filter((event: any) => event.freshness_score > 40)
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'Unknown Source'
    }
  }

  private calculateFreshness(title: string, description: string): number {
    const content = (title + ' ' + description).toLowerCase()
    let score = 50

    // Time indicators
    if (content.includes('today') || content.includes('live') || content.includes('breaking')) score += 25
    if (content.includes('latest') || content.includes('current') || content.includes('now')) score += 15
    
    // Market relevance
    if (content.includes('nifty') || content.includes('sensex') || content.includes('market')) score += 15
    if (content.includes('stock') || content.includes('trading') || content.includes('investment')) score += 10

    return Math.min(95, score)
  }

  private categorizeEvent(content: string): string {
    const lower = content.toLowerCase()
    
    if (lower.includes('rbi') || lower.includes('monetary policy')) return 'RBI Monetary Policy'
    if (lower.includes('nifty') || lower.includes('sensex') || lower.includes('index')) return 'Index Movement'
    if (lower.includes('earning') || lower.includes('result') || lower.includes('quarterly')) return 'Corporate Earnings'
    if (lower.includes('fii') || lower.includes('dii') || lower.includes('flow')) return 'Investment Flows'
    if (lower.includes('bank')) return 'Banking Sector'
    if (lower.includes('it') || lower.includes('tech')) return 'IT Sector'
    if (lower.includes('auto')) return 'Auto Sector'
    if (lower.includes('pharma')) return 'Pharma Sector'
    
    return 'Market News'
  }

  private removeDuplicates(events: any[]): any[] {
    const seen = new Set()
    return events.filter(event => {
      const key = event.title.substring(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
