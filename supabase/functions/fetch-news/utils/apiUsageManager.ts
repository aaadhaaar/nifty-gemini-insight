
export class ApiUsageManager {
  private supabaseClient: any
  private maxDailySearches = 60 // Increased from 8 to utilize full free tier limit

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient
  }

  async checkDailyUsage(): Promise<{ canProceed: boolean; currentSearches: number; remainingSearches: number }> {
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await this.supabaseClient
      .from('api_usage')
      .select('search_count')
      .eq('date', today)
      .eq('api_name', 'brave_search')
      .maybeSingle()

    const currentSearches = usageData?.search_count || 0
    const remainingSearches = this.maxDailySearches - currentSearches
    const canProceed = currentSearches < this.maxDailySearches

    console.log(`Usage: ${currentSearches}/${this.maxDailySearches} searches (free tier)`)
    
    return { canProceed, currentSearches, remainingSearches }
  }

  async updateUsageCount(currentCount: number, newSearches: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    await this.supabaseClient
      .from('api_usage')
      .upsert({
        date: today,
        api_name: 'brave_search',
        search_count: currentCount + newSearches
      })
  }
}
