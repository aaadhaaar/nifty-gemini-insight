
export async function cleanupOldArticles(supabaseClient: any): Promise<void> {
  // Clean up old news articles (older than 7 days)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  await supabaseClient
    .from('news_articles')
    .delete()
    .lt('created_at', oneWeekAgo.toISOString())

  await supabaseClient
    .from('market_analysis')
    .delete()
    .lt('created_at', oneWeekAgo.toISOString())

  console.log('Cleaned up articles older than 7 days')
}
