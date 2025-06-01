
import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Building2 } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  company: string;
  timestamp: string;
  what: string;
  why: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  category: string;
}

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'border-green-400/30 bg-green-400/5';
      case 'bearish':
        return 'border-red-400/30 bg-red-400/5';
      default:
        return 'border-yellow-400/30 bg-yellow-400/5';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[impact as keyof typeof colors];
  };

  return (
    <div className={`glass-effect rounded-2xl p-6 hover:glow transition-all duration-300 hover:scale-[1.02] ${getSentimentColor(news.sentiment)} border`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{news.company}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{news.timestamp}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(news.impact)}`}>
            {news.impact.toUpperCase()}
          </span>
          {getSentimentIcon(news.sentiment)}
        </div>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4 leading-relaxed">
        {news.title}
      </h4>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-sm font-medium text-blue-300">What Happened</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{news.what}</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-sm font-medium text-purple-300">Why It Matters</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{news.why}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300">
          {news.category}
        </span>
      </div>
    </div>
  );
};

export default NewsCard;
