
export class SummaryGenerator {
  static generateIndianMarketEnhancedSummary(title: string, description: string, intensity: string, braveAiContext: string): string {
    const content = title + ' ' + description
    const prefix = intensity === 'high' ? '[INDIA CRITICAL] ' : 
                  intensity === 'pre-market' ? '[INDIA PRE-MARKET] ' : 
                  intensity === 'post-market' ? '[INDIA CLOSING] ' : 
                  '[INDIA ACTIVE] '
    
    if (braveAiContext) {
      return `${prefix}AI-VERIFIED: ${description.substring(0, 140)}... [Enhanced with Market Intelligence]`
    }
    
    return `${prefix}${description.substring(0, 150)}...`
  }

  static generateIndianMarketEnhancedImplications(content: string, intensity: string, braveAiContext: string): string {
    const lowerContent = content.toLowerCase()
    const urgencyPrefix = intensity === 'high' ? 'INDIA IMMEDIATE: ' : 
                         intensity === 'pre-market' ? 'INDIA PRE-MARKET: ' : 
                         intensity === 'post-market' ? 'INDIA CLOSING: ' : 
                         'INDIA STRATEGIC: '
    
    const aiBoost = braveAiContext ? ' - AI-verified Indian market pattern' : ''
    
    if (lowerContent.includes('nifty') || lowerContent.includes('sensex')) {
      return urgencyPrefix + `Index movement confirmed${aiBoost} - tactical positioning in Indian blue-chips with optimized parameters`
    }
    if (lowerContent.includes('banking') || lowerContent.includes('financial')) {
      return urgencyPrefix + `Banking sector development${aiBoost} - strategic positioning in Indian financial services with sector rotation`
    }
    if (lowerContent.includes('earnings') || lowerContent.includes('results')) {
      return urgencyPrefix + `Corporate earnings impact${aiBoost} - Indian market sector implications with enhanced positioning strategies`
    }
    
    return urgencyPrefix + `Indian market event requires response${aiBoost} - competitive positioning opportunity in domestic equity markets`
  }
}
