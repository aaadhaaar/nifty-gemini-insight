
import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Brain, Target } from 'lucide-react';
import { NewsArticle } from '@/hooks/useNewsData';
import { 
  getSentimentColor, 
  getImpactBadge, 
  getCategoryIcon, 
  formatTimeAgo, 
  isAiGenerated 
} from '@/utils/newsUtils';

interface NewsArticleCardProps {
  article: NewsArticle;
}

const NewsArticleCard: React.FC<NewsArticleCardProps> = ({ article }) => {
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

  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-4 md:p-6 hover:bg-slate-700/30 transition-all duration-300 ${getSentimentColor(article.sentiment)}`}>
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
  );
};

export default NewsArticleCard;
