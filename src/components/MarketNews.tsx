
import React from 'react';
import { Clock, TrendingUp, TrendingDown, AlertCircle, Building2, Zap } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  company: string;
  timestamp: string;
  what: string;
  why: string;
  marketImpact: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  category: string;
  expectedMove: string;
}

const marketNews: NewsItem[] = [
  {
    id: '1',
    title: 'Reliance Industries announces major expansion in renewable energy sector',
    company: 'Reliance Industries',
    timestamp: '2 hours ago',
    what: 'Reliance Industries has announced a ₹75,000 crore investment plan for expanding its renewable energy portfolio, including solar manufacturing and green hydrogen production facilities.',
    why: 'This strategic move positions Reliance to capitalize on India\'s energy transition goals and government incentives for clean energy. The investment could significantly boost long-term profitability and ESG credentials.',
    marketImpact: 'Expected to lift Nifty 50 by 40-50 points due to Reliance\'s heavy weightage (11.2%). Energy and infrastructure stocks likely to see positive spillover effect.',
    sentiment: 'bullish' as const,
    impact: 'high' as const,
    category: 'Strategic Investment',
    expectedMove: '+2.5% to +3.2%'
  },
  {
    id: '2',
    title: 'RBI maintains repo rate, signals continued hawkish stance',
    company: 'Reserve Bank of India',
    timestamp: '3 hours ago',
    what: 'RBI Governor announced that the repo rate will remain unchanged at 6.5% for the sixth consecutive meeting, citing persistent inflation concerns and global economic uncertainties.',
    why: 'Higher rates increase borrowing costs for businesses and consumers, potentially slowing economic growth. However, it also helps control inflation and maintains currency stability.',
    marketImpact: 'Banking stocks may see mixed reactions - higher NIMs positive but slower credit growth negative. Rate-sensitive sectors like real estate and auto may face headwinds.',
    sentiment: 'bearish' as const,
    impact: 'medium' as const,
    category: 'Monetary Policy',
    expectedMove: '-1.2% to -0.8%'
  },
  {
    id: '3',
    title: 'TCS reports stellar Q3 earnings, raises FY24 guidance',
    company: 'Tata Consultancy Services',
    timestamp: '4 hours ago',
    what: 'TCS reported quarterly revenue of ₹58,229 crores, marking a 15% year-over-year growth. The company also raised its FY24 revenue guidance and announced major client wins in BFSI and retail.',
    why: 'Strong earnings indicate robust demand for IT services globally. New client acquisitions suggest sustained growth momentum and market share expansion in key verticals, boosting investor confidence.',
    marketImpact: 'IT sector rally expected with TCS leading the charge. Other IT majors like Infosys, Wipro likely to benefit from sector rotation and improved sentiment.',
    sentiment: 'bullish' as const,
    impact: 'high' as const,
    category: 'Earnings Report',
    expectedMove: '+1.8% to +2.4%'
  }
];

const MarketNews = () => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'border-emerald-400/30 bg-emerald-400/5';
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
      low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[impact as keyof typeof colors];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <Building2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white">Market News</h2>
          <p className="text-sm text-slate-400">Significant Nifty 50 impact</p>
        </div>
      </div>

      {marketNews.map((news) => (
        <div key={news.id} className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-4 md:p-6 hover:bg-slate-700/30 transition-all duration-300 ${getSentimentColor(news.sentiment)}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-sm md:text-base">{news.company}</h3>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{news.timestamp}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(news.impact)}`}>
                {news.impact.toUpperCase()}
              </span>
              {getSentimentIcon(news.sentiment)}
            </div>
          </div>

          <h4 className="text-base md:text-lg font-semibold text-white mb-4 leading-tight">
            {news.title}
          </h4>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-xs font-medium text-blue-300">What Happened</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{news.what}</p>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-xs font-medium text-purple-300">Why It Matters</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{news.why}</p>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium text-orange-300">Market Impact</span>
                </div>
                <div className="text-xs font-semibold text-orange-300">
                  {news.expectedMove}
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{news.marketImpact}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
              {news.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketNews;
