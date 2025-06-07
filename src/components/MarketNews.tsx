import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Building2, Zap } from 'lucide-react';
import { useNewsData } from '@/hooks/useNewsData';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';

const MarketNews = () => {
  const { data: newsArticles, isLoading, error, refetch } = useNewsData();

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'border-emerald-400/30 bg-emerald-400/5';
      case 'negative':
        return 'border-red-400/30 bg-red-400/5';
      default:
        return 'border-yellow-400/30 bg-yellow-400/5';
    }
  };

  const getImpactBadge = (impact: string | null) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading news</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Market News</h2>
            <p className="text-sm text-slate-400">Auto-updated every 2 hours</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {!newsArticles || newsArticles.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
          <p className="text-slate-400 mb-2">No news articles available</p>
          <p className="text-xs text-slate-500">News will be automatically fetched every 2 hours</p>
        </div>
      ) : (
        newsArticles.map((article) => (
          <div key={article.id} className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-4 md:p-6 hover:bg-slate-700/30 transition-all duration-300 ${getSentimentColor(article.sentiment)}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-sm md:text-base">{article.source || 'News Source'}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(article.published_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(article.market_impact)}`}>
                  {(article.market_impact || 'LOW').toUpperCase()}
                </span>
                {getSentimentIcon(article.sentiment)}
              </div>
            </div>

            <h4 className="text-base md:text-lg font-semibold text-white mb-4 leading-tight">
              {article.title}
            </h4>

            {article.content && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-medium text-blue-300">Summary</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{article.content}</p>
                </div>

                {article.companies && article.companies.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-xs font-medium text-purple-300">Companies Mentioned</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {article.companies.map((company, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                {article.category || 'Market News'}
              </span>
              
              {article.url && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Read Full Article
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MarketNews;
