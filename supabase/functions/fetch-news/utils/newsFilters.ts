
export function isRelevantMarketNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  // Broadened relevant keywords for Indian market news
  const relevantKeywords = [
    'nifty', 'sensex', 'bse', 'nse', 'stock market', 'shares', 'equity', 'index',
    'rbi', 'sebi', 'policy', 'rate', 'inflation', 'gdp', 'budget', 'fiscal',
    'earnings', 'results', 'quarterly', 'profit', 'revenue', 'growth',
    'ipo', 'listing', 'merger', 'acquisition', 'fii', 'dii', 'investment',
    'banking', 'financial', 'fintech', 'insurance', 'nbfc',
    'it sector', 'technology', 'software', 'pharma', 'healthcare', 'auto', 'automobile',
    'energy', 'oil', 'gas', 'renewable', 'infrastructure', 'real estate',
    'rupee', 'dollar', 'forex', 'currency', 'commodity', 'gold', 'silver',
    'mutual fund', 'sip', 'portfolio', 'trading', 'investor', 'market cap',
    'startup', 'unicorn', 'funding', 'venture capital', 'private equity'
  ]
  
  // Quality indicators (positive signals)
  const qualityKeywords = [
    'breaking', 'announced', 'reported', 'launched', 'approved', 'signed',
    'increased', 'decreased', 'growth', 'decline', 'performance', 'impact',
    'analysis', 'outlook', 'forecast', 'trend', 'update', 'news'
  ]
  
  // Avoid spam/irrelevant content
  const excludeKeywords = [
    'horoscope', 'astrology', 'celebrity', 'bollywood', 'cricket', 'football',
    'weather', 'traffic', 'recipe', 'health tips', 'lifestyle', 'entertainment'
  ]
  
  const hasRelevant = relevantKeywords.some(keyword => text.includes(keyword))
  const hasQuality = qualityKeywords.some(keyword => text.includes(keyword))
  const hasExcluded = excludeKeywords.some(keyword => text.includes(keyword))
  
  return hasRelevant && hasQuality && !hasExcluded
}

export function calculateFreshnessScore(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase()
  let score = 5 // Base score
  
  // Time-based freshness indicators
  const ultraFreshKeywords = ['today', 'now', 'live', 'breaking', 'just', 'minutes ago', 'hours ago']
  const freshKeywords = ['this week', 'recently', 'latest', 'current', 'new', 'update']
  const moderateKeywords = ['this month', 'announced', 'reported', 'launched']
  
  if (ultraFreshKeywords.some(keyword => text.includes(keyword))) {
    score += 5
  } else if (freshKeywords.some(keyword => text.includes(keyword))) {
    score += 3
  } else if (moderateKeywords.some(keyword => text.includes(keyword))) {
    score += 1
  }
  
  // Market relevance boost
  const highImpactKeywords = ['nifty', 'sensex', 'rbi', 'policy', 'earnings', 'ipo']
  if (highImpactKeywords.some(keyword => text.includes(keyword))) {
    score += 2
  }
  
  return score
}

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    if (domain.includes('economictimes')) return 'Economic Times'
    if (domain.includes('moneycontrol')) return 'MoneyControl'
    if (domain.includes('livemint')) return 'Mint'
    if (domain.includes('business-standard')) return 'Business Standard'
    if (domain.includes('financialexpress')) return 'Financial Express'
    if (domain.includes('zeebiz')) return 'Zee Business'
    if (domain.includes('ndtv')) return 'NDTV Business'
    if (domain.includes('cnbctv18')) return 'CNBC TV18'
    if (domain.includes('bloomberg')) return 'Bloomberg'
    if (domain.includes('reuters')) return 'Reuters'
    return domain
  } catch {
    return 'Market Intelligence'
  }
}
