
export const getSentimentIcon = (sentiment: string | null) => {
  switch (sentiment) {
    case 'positive':
      return 'TrendingUp';
    case 'negative':
      return 'TrendingDown';
    default:
      return 'AlertCircle';
  }
};

export const getSentimentColor = (sentiment: string | null) => {
  switch (sentiment) {
    case 'positive':
      return 'border-emerald-400/30 bg-emerald-400/5';
    case 'negative':
      return 'border-red-400/30 bg-red-400/5';
    default:
      return 'border-yellow-400/30 bg-yellow-400/5';
  }
};

export const getImpactBadge = (impact: string | null) => {
  const colors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };
  return colors[impact as keyof typeof colors] || colors.medium;
};

export const getCategoryIcon = (category: string | null) => {
  switch (category) {
    case 'Monetary Policy':
      return '🏛️';
    case 'IPO & Listings':
      return '🚀';
    case 'Corporate Earnings':
      return '📊';
    case 'Investment Flows':
      return '💰';
    case 'Regulatory':
      return '⚖️';
    case 'Currency & Forex':
      return '💱';
    case 'Startup Ecosystem':
      return '🦄';
    default:
      return '📈';
  }
};

export const formatTimeAgo = (dateString: string | null) => {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return 'Recent';
};

export const isAiGenerated = (source: string | null) => {
  return source === 'AI Market Analysis' || source === 'Market Intelligence';
};
