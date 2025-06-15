
export class MarketAnalysis {
  static extractIndianMarketTitle(query: string, intensity: string): string {
    const titles = {
      high: 'Critical Market Development',
      'pre-market': 'Pre-Market Analysis',
      'post-market': 'Closing Bell Report',
      standard: 'Market Update'
    }
    return titles[intensity as keyof typeof titles] || 'Market Intelligence'
  }

  static enhanceIndianMarketSummary(summary: string, intensity: string): string {
    const prefix = intensity === 'high' ? '[CRITICAL INDIAN MARKET] ' : 
                  intensity === 'pre-market' ? '[PRE-MARKET INDIA] ' : 
                  intensity === 'post-market' ? '[CLOSING INDIA] ' : 
                  '[INDIAN MARKET] '
    return `${prefix}${summary}`
  }

  static generateIndianMarketImplications(aiSummary: string, intensity: string): string {
    const urgencyPrefix = intensity === 'high' ? 'INDIAN MARKET CRITICAL: ' : 
                         intensity === 'pre-market' ? 'PRE-MARKET INDIA: ' : 
                         intensity === 'post-market' ? 'CLOSING INDIA: ' : 
                         'INDIAN MARKET: '
    
    const lowerSummary = aiSummary.toLowerCase()
    
    // Indian market specific pattern matching
    if (lowerSummary.includes('nifty') || lowerSummary.includes('sensex')) {
      return urgencyPrefix + 'Major index movement detected - algorithmic positioning in blue-chip stocks recommended with enhanced risk parameters'
    }
    if (lowerSummary.includes('rbi') && (lowerSummary.includes('rate') || lowerSummary.includes('policy'))) {
      return urgencyPrefix + 'RBI policy impact analyzed - banking and financial sector repositioning opportunity with sector rotation signals'
    }
    if (lowerSummary.includes('fii') || lowerSummary.includes('dii')) {
      return urgencyPrefix + 'Institutional flow patterns detected - foreign and domestic investor activity creating momentum opportunities'
    }
    if (lowerSummary.includes('earnings') && (lowerSummary.includes('beat') || lowerSummary.includes('miss'))) {
      return urgencyPrefix + 'Corporate earnings impact triggers sector-wide implications with follow-through trade opportunities'
    }
    
    return urgencyPrefix + 'Indian market development requires tactical response - enhanced competitive positioning opportunity identified'
  }

  static calculateIndianMarketConfidence(intensity: string, aiSummary: string): number {
    let baseConfidence = 96 // Higher confidence for Indian market focus
    
    if (intensity === 'high') baseConfidence += 2
    if (intensity === 'pre-market' || intensity === 'post-market') baseConfidence += 1
    if (aiSummary.length > 500) baseConfidence += 1
    
    return Math.min(99, baseConfidence)
  }

  static getIndianMarketBoost(title: string, description: string): number {
    const content = `${title} ${description}`.toLowerCase()
    let boost = 0
    
    // Boost for Indian market specific terms
    const indianTerms = ['nifty', 'sensex', 'bse', 'nse', 'rbi', 'sebi', 'rupee', 'india', 'indian']
    const sectorTerms = ['banking', 'it', 'pharma', 'auto', 'fmcg', 'energy', 'metal']
    const impactTerms = ['surge', 'rally', 'crash', 'volatility', 'breakout', 'earnings']
    
    boost += indianTerms.filter(term => content.includes(term)).length * 5
    boost += sectorTerms.filter(term => content.includes(term)).length * 3
    boost += impactTerms.filter(term => content.includes(term)).length * 2
    
    return Math.min(20, boost)
  }

  static categorizeIndianMarketEvent(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('rbi') || lowerContent.includes('monetary') || lowerContent.includes('policy')) {
      return 'RBI Monetary Policy'
    }
    if (lowerContent.includes('nifty') || lowerContent.includes('sensex') || lowerContent.includes('index')) {
      return 'Index Movement'
    }
    if (lowerContent.includes('earnings') || lowerContent.includes('results') || lowerContent.includes('quarterly')) {
      return 'Corporate Earnings'
    }
    if (lowerContent.includes('fii') || lowerContent.includes('dii') || lowerContent.includes('institutional')) {
      return 'Investment Flows'
    }
    if (lowerContent.includes('banking') || lowerContent.includes('financial')) {
      return 'Banking Sector'
    }
    if (lowerContent.includes('it') || lowerContent.includes('technology') || lowerContent.includes('software')) {
      return 'IT Sector'
    }
    if (lowerContent.includes('pharma') || lowerContent.includes('healthcare')) {
      return 'Pharma Sector'
    }
    if (lowerContent.includes('auto') || lowerContent.includes('automobile')) {
      return 'Auto Sector'
    }
    if (lowerContent.includes('rupee') || lowerContent.includes('forex') || lowerContent.includes('currency')) {
      return 'Currency & Forex'
    }
    
    return 'Indian Market Events'
  }
}
