
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useNewsData } from '@/hooks/useNewsData';
import { useFilteredNews } from '@/hooks/useFilteredNews';
import LoadingSpinner from './LoadingSpinner';
import MarketNewsHeader from './MarketNewsHeader';
import NewsArticleCard from './NewsArticleCard';
import MarketNewsEmptyState from './MarketNewsEmptyState';
import { Button } from '@/components/ui/button';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

interface MarketNewsProps {
  selectedStock?: Stock;
}

const MarketNews: React.FC<MarketNewsProps> = ({ selectedStock }) => {
  const { data: newsArticles, isLoading, error, refetch, isFetching } = useNewsData();
  const filteredArticles = useFilteredNews(newsArticles, selectedStock);

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
      <MarketNewsHeader
        selectedStock={selectedStock}
        onRefetch={() => refetch()}
        isFetching={isFetching}
      />

      {!filteredArticles || filteredArticles.length === 0 ? (
        <MarketNewsEmptyState
          selectedStock={selectedStock}
          onRefetch={() => refetch()}
        />
      ) : (
        filteredArticles.map((article) => (
          <NewsArticleCard key={article.id} article={article} />
        ))
      )}
    </div>
  );
};

export default MarketNews;
