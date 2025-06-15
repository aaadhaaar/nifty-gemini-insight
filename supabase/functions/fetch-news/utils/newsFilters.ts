
export function isRelevantMarketNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  
  // Enhanced Indian market focus with comprehensive coverage
  const relevantKeywords = [
    // Indian Market Indices & Exchanges
    'nifty', 'sensex', 'bse', 'nse', 'stock market', 'shares', 'equity', 'index',
    'nifty 50', 'nifty bank', 'nifty auto', 'nifty it', 'nifty pharma', 'nifty fmcg',
    'nifty metal', 'nifty realty', 'nifty energy', 'nifty psu bank',
    
    // Regulatory & Policy
    'rbi', 'sebi', 'policy', 'rate', 'inflation', 'gdp', 'budget', 'fiscal',
    'monetary policy', 'repo rate', 'reverse repo', 'crr', 'slr', 'mpc',
    
    // Corporate & Financial Performance
    'earnings', 'results', 'quarterly', 'profit', 'revenue', 'growth',
    'q1', 'q2', 'q3', 'q4', 'fy24', 'fy25', 'annual results', 'guidance',
    
    // Market Activities
    'ipo', 'listing', 'merger', 'acquisition', 'fii', 'dii', 'investment',
    'fpo', 'rights issue', 'bonus', 'dividend', 'split', 'buyback',
    
    // Sectors
    'banking', 'financial', 'fintech', 'insurance', 'nbfc', 'mutual fund',
    'it sector', 'technology', 'software', 'pharma', 'healthcare', 'auto', 'automobile',
    'energy', 'oil', 'gas', 'renewable', 'infrastructure', 'real estate',
    'fmcg', 'consumer goods', 'textile', 'steel', 'cement', 'mining',
    
    // Economic Indicators
    'rupee', 'dollar', 'forex', 'currency', 'commodity', 'gold', 'silver',
    'crude oil', 'copper', 'zinc', 'aluminum', 'agricultural commodities',
    
    // Investment & Trading
    'mutual fund', 'sip', 'portfolio', 'trading', 'investor', 'market cap',
    'systematic', 'elss', 'debt fund', 'equity fund', 'hybrid fund',
    
    // Business & Economy
    'startup', 'unicorn', 'funding', 'venture capital', 'private equity',
    'economic survey', 'union budget', 'gst', 'tax', 'export', 'import',
    
    // Market Events
    'block deal', 'bulk deal', 'institutional', 'promoter', 'pledge',
    'delisting', 'suspension', 'circuit', 'upper circuit', 'lower circuit'
  ]
  
  // Quality and relevance indicators
  const qualityKeywords = [
    'breaking', 'announced', 'reported', 'launched', 'approved', 'signed',
    'increased', 'decreased', 'growth', 'decline', 'performance', 'impact',
    'analysis', 'outlook', 'forecast', 'trend', 'update', 'news', 'alert',
    'surge', 'rally', 'crash', 'volatility', 'momentum', 'breakout'
  ]
  
  // Exclude irrelevant content
  const excludeKeywords = [
    'horoscope', 'astrology', 'celebrity', 'bollywood', 'cricket', 'football',
    'weather', 'traffic', 'recipe', 'health tips', 'lifestyle', 'entertainment',
    'fashion', 'beauty', 'travel', 'food', 'movie', 'music', 'sports'
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
  const ultraFreshKeywords = ['today', 'now', 'live', 'breaking', 'just', 'minutes ago', 'hours ago', 'this morning']
  const freshKeywords = ['this week', 'recently', 'latest', 'current', 'new', 'update', 'yesterday']
  const moderateKeywords = ['this month', 'announced', 'reported', 'launched', 'scheduled']
  
  if (ultraFreshKeywords.some(keyword => text.includes(keyword))) {
    score += 5
  } else if (freshKeywords.some(keyword => text.includes(keyword))) {
    score += 3
  } else if (moderateKeywords.some(keyword => text.includes(keyword))) {
    score += 1
  }
  
  // Market relevance boost for high-impact events
  const criticalKeywords = ['nifty', 'sensex', 'rbi', 'policy', 'earnings', 'ipo', 'results']
  const sectorKeywords = ['banking', 'it', 'pharma', 'auto', 'energy', 'fmcg']
  const eventKeywords = ['surge', 'crash', 'rally', 'volatility', 'breakout', 'breakdown']
  
  if (criticalKeywords.some(keyword => text.includes(keyword))) {
    score += 3
  }
  if (sectorKeywords.some(keyword => text.includes(keyword))) {
    score += 2
  }
  if (eventKeywords.some(keyword => text.includes(keyword))) {
    score += 2
  }
  
  return score
}

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    
    // Enhanced source mapping for Indian financial media
    const sourceMap: { [key: string]: string } = {
      'economictimes.indiatimes.com': 'Economic Times',
      'economictimes': 'Economic Times',
      'moneycontrol.com': 'MoneyControl',
      'moneycontrol': 'MoneyControl',
      'livemint.com': 'Mint',
      'livemint': 'Mint',
      'business-standard.com': 'Business Standard',
      'business-standard': 'Business Standard',
      'financialexpress.com': 'Financial Express',
      'financialexpress': 'Financial Express',
      'zeebiz.com': 'Zee Business',
      'zeebiz': 'Zee Business',
      'ndtv.com': 'NDTV Business',
      'ndtv': 'NDTV Business',
      'cnbctv18.com': 'CNBC TV18',
      'cnbctv18': 'CNBC TV18',
      'bloomberg.com': 'Bloomberg',
      'bloomberg': 'Bloomberg',
      'reuters.com': 'Reuters',
      'reuters': 'Reuters',
      'investing.com': 'Investing.com',
      'investing': 'Investing.com',
      'marketwatch.com': 'MarketWatch',
      'marketwatch': 'MarketWatch',
      'tradingview.com': 'TradingView',
      'tradingview': 'TradingView',
      'equitymaster.com': 'Equity Master',
      'equitymaster': 'Equity Master'
    }
    
    for (const [key, value] of Object.entries(sourceMap)) {
      if (domain.includes(key)) {
        return value
      }
    }
    
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return 'Market Intelligence'
  }
}
