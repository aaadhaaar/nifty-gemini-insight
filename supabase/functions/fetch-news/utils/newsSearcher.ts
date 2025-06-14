
import { isRelevantMarketNews, calculateFreshnessScore, extractDomain } from './newsFilters.ts'

export interface NewsResult {
  title: string
  description: string
  url: string
  source: string
  timestamp: string
  freshness_score: number
}

export class NewsSearcher {
  private braveApiKey: string

  constructor(braveApiKey: string) {
    this.braveApiKey = braveApiKey
  }

  getSearchQueries(): string[] {
    return [
      'Nifty 50 Sensex BSE NSE Indian stock market news today breaking live',
      'Indian stock market earnings results RBI monetary policy rate decision',
      'India IPO listing FII DII foreign investment flows market impact',
      'Banking sector IT pharma auto stocks India market performance news',
      'Indian rupee USD forex crude oil gold commodity market news',
      'SEBI regulations Indian capital markets corporate governance news',
      'Mutual funds SIP investment India market trends analysis',
      'Startup unicorn funding India venture capital private equity news'
    ]
  }

  async searchNews(query: string): Promise<NewsResult[]> {
    console.log(`Searching for market news: ${query}`)
    
    try {
      const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=15&freshness=pw&country=IN&search_lang=en&result_filter=web`, {
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
      console.log(`Found ${results.length} results for market news query`)

      const relevantNews: NewsResult[] = []

      for (const result of results) {
        if (!result.title || !result.description) continue

        if (isRelevantMarketNews(result.title, result.description)) {
          const freshnessScore = calculateFreshnessScore(result.title, result.description)
          
          relevantNews.push({
            title: result.title,
            description: result.description,
            url: result.url || '',
            source: extractDomain(result.url || ''),
            timestamp: new Date().toISOString(),
            freshness_score: freshnessScore
          })
        }
      }

      return relevantNews
    } catch (error) {
      console.error(`Error processing news query "${query}":`, error)
      return []
    }
  }
}
