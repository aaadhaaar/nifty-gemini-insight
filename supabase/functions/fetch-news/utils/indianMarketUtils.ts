
export function determineIndianMarketSentiment(implications: string): string {
  const positive = ['bullish', 'positive', 'boost', 'growth', 'opportunity', 'strong', 'beat', 'surge', 'rally', 'breakout', 'nifty up', 'sensex gains']
  const negative = ['bearish', 'negative', 'headwind', 'decline', 'risk', 'concern', 'weak', 'challenge', 'fall', 'crash', 'breakdown', 'nifty down', 'sensex falls']
  
  const lowerImplications = implications.toLowerCase()
  const positiveCount = positive.filter(word => lowerImplications.includes(word)).length
  const negativeCount = negative.filter(word => lowerImplications.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

export function determineIndianMarketImpact(confidence: number, intensity: string, magnitude: number, hasBraveAi: boolean): string {
  const boost = intensity === 'high' ? 25 : intensity === 'pre-market' || intensity === 'post-market' ? 20 : 15
  const braveAiBoost = hasBraveAi ? 20 : 0
  const indianMarketBoost = 10 // Additional boost for Indian market focus
  const adjustedScore = confidence + boost + (magnitude * 0.6) + braveAiBoost + indianMarketBoost
  
  if (adjustedScore >= 96) return 'high'
  if (adjustedScore >= 82) return 'medium'
  return 'low'
}

export function extractIndianCompanies(description: string): string[] {
  const companies = []
  const indianCompanies = [
    'TCS', 'Infosys', 'Wipro', 'HCL Tech', 'Tech Mahindra',
    'Reliance', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank',
    'ITC', 'HUL', 'Nestle India', 'Britannia', 'Dabur',
    'Bharti Airtel', 'Jio', 'Vodafone Idea',
    'Tata Motors', 'Maruti Suzuki', 'Bajaj Auto', 'Hero MotoCorp', 'TVS Motor',
    'Sun Pharma', 'Dr Reddy', 'Cipla', 'Lupin', 'Aurobindo Pharma',
    'L&T', 'Asian Paints', 'UltraTech Cement', 'Grasim', 'ACC',
    'ONGC', 'Coal India', 'IOC', 'BPCL', 'Adani Green', 'Tata Power',
    'JSW Steel', 'Tata Steel', 'Hindalco', 'Vedanta', 'SAIL'
  ]
  
  for (const company of indianCompanies) {
    if (description.toUpperCase().includes(company.toUpperCase())) {
      companies.push(company)
    }
  }
  
  return companies
}

export function getIndianMarketPriorityBoost(title: string, description: string): number {
  const content = `${title} ${description}`.toLowerCase()
  let boost = 0
  
  // Priority boost for Indian market specific terms
  const criticalTerms = ['nifty', 'sensex', 'rbi', 'sebi']
  const sectorTerms = ['banking', 'it sector', 'pharma', 'auto sector', 'fmcg']
  const eventTerms = ['earnings', 'results', 'policy', 'ipo', 'listing']
  
  boost += criticalTerms.filter(term => content.includes(term)).length * 10
  boost += sectorTerms.filter(term => content.includes(term)).length * 6
  boost += eventTerms.filter(term => content.includes(term)).length * 4
  
  return Math.min(30, boost)
}
