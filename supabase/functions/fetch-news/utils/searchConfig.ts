
export class SearchConfig {
  static getSearchCount(intensity: string): number {
    switch (intensity) {
      case 'high': return 25
      case 'pre-market':
      case 'post-market': return 20
      default: return 15
    }
  }

  static getResultLimit(intensity: string): number {
    switch (intensity) {
      case 'high': return 15
      case 'pre-market':
      case 'post-market': return 12
      default: return 8
    }
  }

  static getFreshnessParam(intensity: string): string {
    return 'pd' // Past day for fresh Indian market content
  }

  static calculateTimeRelevance(intensity: string): number {
    const hour = new Date().getHours()
    let baseRelevance = 0
    
    switch (intensity) {
      case 'high': baseRelevance = 35; break
      case 'pre-market': baseRelevance = 30; break
      case 'post-market': baseRelevance = 25; break
      default: baseRelevance = 20
    }
    
    // Boost during Indian market hours (9:15 AM to 3:30 PM IST)
    if (hour >= 9 && hour <= 15) baseRelevance += 20
    
    return baseRelevance
  }

  static calculateImpactMagnitude(content: string, intensity: string): number {
    const lowerContent = content.toLowerCase()
    let magnitude = 15
    
    // High-impact keywords for Indian market
    const highImpactWords = ['breakout', 'breakdown', 'surge', 'crash', 'rally', 'plunge', 'soar', 'tumble', 'circuit']
    const mediumImpactWords = ['rise', 'fall', 'gain', 'loss', 'up', 'down', 'beat', 'miss', 'upgrade', 'downgrade']
    const indianSpecificWords = ['nifty', 'sensex', 'rbi', 'sebi', 'rupee']
    
    const highCount = highImpactWords.filter(word => lowerContent.includes(word)).length
    const mediumCount = mediumImpactWords.filter(word => lowerContent.includes(word)).length
    const indianCount = indianSpecificWords.filter(word => lowerContent.includes(word)).length
    
    magnitude += (highCount * 25) + (mediumCount * 12) + (indianCount * 15)
    
    if (intensity === 'high') magnitude += 20
    
    return Math.min(60, magnitude)
  }
}
