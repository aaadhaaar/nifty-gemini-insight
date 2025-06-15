
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
  impact_magnitude?: number
  brave_ai_summary?: string
}
