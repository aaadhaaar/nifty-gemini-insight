
import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Zap, Wifi } from 'lucide-react';
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
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return 'Earlier today';
  };

  const isUltraFresh = (dateString: string | null) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 3; // Ultra fresh if within 3 hours
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
          <p className="text-red-400 mb-4">Error loading fresh news</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh News
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
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">The Undercurrent</h2>
            <p className="text-sm text-slate-400">Live market insights • What's happening NOW</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wifi className="w-3 h-3 text-green-400" />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {!newsArticles || newsArticles.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
          <p className="text-slate-400 mb-2">No fresh market analysis available</p>
          <p className="text-xs text-slate-500">Fresh insights will appear as market events happen</p>
        </div>
      ) : (
        newsArticles.map((article) => (
          <div key={article.id} className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-4 md:p-6 hover:bg-slate-700/30 transition-all duration-300 ${getSentimentColor(article.sentiment)}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUltraFresh(article.created_at) 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white text-sm md:text-base">
                      {article.source || 'Live Market News'}
                    </h3>
                    {isUltraFresh(article.created_at) && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(article.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(article.market_impact)}`}>
                  {(article.market_impact || 'LIVE').toUpperCase()}
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
                    <span className="text-xs font-medium text-blue-300">What's Happening Now</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{article.content}</p>
                </div>

                {article.companies && article.companies.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-xs font-medium text-purple-300">Key Companies</span>
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

            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                {article.category || 'Breaking Market News'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MarketNews;
