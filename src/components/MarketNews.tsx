import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Zap, Wifi, RefreshCw, Brain, Target } from 'lucide-react';
import { useNewsData } from '@/hooks/useNewsData';
import LoadingSpinner from './LoadingSpinner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const MarketNews = () => {
  const { data: newsArticles, isLoading, error, refetch, isFetching } = useNewsData();

  // -------- ADDED FILTER TO HIDE "USELESS" DEMO DATA --------
  // Hide articles from fallback/dummy sources and titles
  const filteredArticles = (newsArticles || []).filter((article) => {
    if (!article) return false;
    // Titles of the dummy card to be filtered out
    const dummyTitles = [
      'Indian Market Intelligence Update',
    ];
    // Sources of the dummy/fallback data to be filtered out
    const dummySources = [
      'Indian Market AI Engine',
      'Market Intelligence Engine',
      'Market Intelligence',
    ];
    // Remove if title is dummy or source is fallback/demo
    if (dummyTitles.includes(article.title?.trim())) return false;
    if (dummySources.includes(article.source?.trim())) return false;
    // (Optional) If both title and content match the classic placeholders, filter those as well
    if (
      article.content &&
      article.content.includes('Indian market intelligence system analyzing Nifty, Sensex movements') &&
      article.summary &&
      article.summary.includes('Strategic positioning opportunities identified across Indian equity sectors')
    ) {
      return false;
    }
    return true;
  });

  const handleForceRefresh = async () => {
    console.log('Force refreshing market intelligence...');
    try {
      // Call the edge function with force refresh
      const { data: fetchResult, error: fetchError } = await supabase.functions.invoke('fetch-news', {
        body: { 
          searchIntensity: 'high',
          timeContext: new Date().getHours(),
          forceRefresh: true
        }
      });

      if (fetchError) {
        console.error('Error force refreshing:', fetchError);
      } else {
        console.log('Force refresh result:', fetchResult);
      }

      // Refetch the data from the hook
      await refetch();
    } catch (error) {
      console.error('Error during force refresh:', error);
    }
  };

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
    return colors[impact as keyof typeof colors] || colors.medium;
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case 'RBI Monetary Policy':
      case 'Monetary Policy':
        return '🏛️';
      case 'Index Movement':
        return '📊';
      case 'Corporate Earnings':
        return '💰';
      case 'Investment Flows':
        return '💸';
      case 'Banking Sector':
        return '🏦';
      case 'IT Sector':
        return '💻';
      case 'Pharma Sector':
        return '💊';
      case 'Auto Sector':
        return '🚗';
      case 'Currency & Forex':
        return '💱';
      case 'Indian Market Events':
      default:
        return '📈';
    }
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
    return 'Recent';
  };

  const isAiGenerated = (source: string | null) => {
    return source === 'Indian Market AI Intelligence' || 
           source === 'Indian Market AI Engine' ||
           source === 'Market Intelligence';
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
          <p className="text-red-400 mb-4">Error loading market events</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Market Events Intelligence</h2>
            <p className="text-sm text-slate-400">AI-powered market events • Real-time analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            disabled={isFetching}
            className="text-xs"
          >
            {isFetching ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            size="sm"
            disabled={isFetching}
            className="text-xs bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
          >
            {isFetching ? (
              <Brain className="w-3 h-3 animate-pulse" />
            ) : (
              <Brain className="w-3 h-3" />
            )}
            AI Scan
          </Button>
          <div className="flex items-center space-x-2">
            <Wifi className="w-3 h-3 text-green-400" />
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
      </div>

      {!filteredArticles || filteredArticles.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
          <p className="text-slate-400 mb-2">No market events available</p>
          <p className="text-xs text-slate-500 mb-4">AI analysis will appear as market events develop</p>
          <div className="space-x-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan for Events
            </Button>
            <Button onClick={handleForceRefresh} variant="outline" size="sm" className="bg-purple-500/20 border-purple-500/30 text-purple-300">
              <Brain className="w-4 h-4 mr-2" />
              Force AI Scan
            </Button>
          </div>
        </div>
      ) : (
        filteredArticles.map((article) => (
          <div key={article.id} className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-4 md:p-6 hover:bg-slate-700/30 transition-all duration-300 ${getSentimentColor(article.sentiment)}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isAiGenerated(article.source) 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                }`}>
                  {isAiGenerated(article.source) ? (
                    <Brain className="w-5 h-5 text-white" />
                  ) : (
                    <Target className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(article.category)}</span>
                    <h3 className="font-semibold text-white text-sm md:text-base">
                      {article.category || 'Market Event'}
                    </h3>
                    {isAiGenerated(article.source) && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        AI ANALYSIS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(article.created_at)}</span>
                    <span>•</span>
                    <span>{article.source || 'Market Intelligence'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(article.market_impact)}`}>
                  {(article.market_impact || 'MEDIUM').toUpperCase()}
                </span>
                {getSentimentIcon(article.sentiment)}
              </div>
            </div>

            <h4 className="text-base md:text-lg font-semibold text-white mb-4 leading-tight">
              {article.title}
            </h4>

            <div className="space-y-3">
              {article.content && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-medium text-blue-300">Event Analysis</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{article.content}</p>
                </div>
              )}

              {article.summary && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-medium text-emerald-300">Market Implications</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{article.summary}</p>
                </div>
              )}

              {article.companies && article.companies.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-xs font-medium text-purple-300">Companies Involved</span>
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
          </div>
        ))
      )}
    </div>
  );
};

export default MarketNews;
