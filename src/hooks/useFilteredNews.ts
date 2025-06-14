
import React from 'react';
import { NewsArticle } from '@/hooks/useNewsData';

interface Stock {
  symbol: string;
  name: string;
}

export const useFilteredNews = (newsArticles: NewsArticle[] | undefined, selectedStock?: Stock) => {
  return React.useMemo(() => {
    if (!newsArticles || !selectedStock) return newsArticles;
    
    return newsArticles.filter(article => {
      // Check if the stock is mentioned in companies array
      if (article.companies?.includes(selectedStock.symbol)) return true;
      
      // Check if stock symbol or name is mentioned in title or content
      const searchTerms = [selectedStock.symbol, selectedStock.name.toLowerCase()];
      const articleText = `${article.title} ${article.content || ''} ${article.summary || ''}`.toLowerCase();
      
      return searchTerms.some(term => articleText.includes(term.toLowerCase()));
    });
  }, [newsArticles, selectedStock]);
};
