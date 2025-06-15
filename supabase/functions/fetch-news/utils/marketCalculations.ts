
export function calculateIndianMarketEfficiency(hour: number, intensity: string, searches: number, braveAiEvents: number): string {
  const isIndianMarketHours = hour >= 9 && hour <= 15 // IST market hours
  const isPeakHours = (hour >= 9 && hour < 10) || (hour >= 14.5 && hour < 15.5)
  
  if (isPeakHours && intensity === 'high' && braveAiEvents > 0) return 'Maximum Indian Market Intelligence Edge'
  if (isIndianMarketHours && searches > 3 && braveAiEvents > 0) return 'High Indian Market Intelligence Efficiency'
  if (isIndianMarketHours && braveAiEvents > 0) return 'Good Indian Market Intelligence Coverage'
  if (intensity === 'pre-market' || intensity === 'post-market') return 'Strategic Indian Market Intelligence Mode'
  return 'Enhanced Indian Market Conservation'
}

export function calculateIndianMarketAdvantage(eventCount: number, indianEvents: number, braveAiEvents: number, intensity: string): string {
  if (eventCount >= 18 && indianEvents >= 5 && braveAiEvents >= 3 && intensity === 'high') return 'Elite Indian Market Intelligence Advantage'
  if (eventCount >= 14 && indianEvents >= 4 && braveAiEvents >= 2) return 'Strong Indian Market Competitive Position'
  if (eventCount >= 10 && indianEvents >= 3 && braveAiEvents >= 1) return 'Good Indian Market Coverage'
  if (eventCount >= 6 && indianEvents >= 2) return 'Basic Indian Market Intelligence'
  return 'Minimal Indian Market Coverage'
}
