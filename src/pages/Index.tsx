
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import NewsCard from '@/components/NewsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demo purposes
const mockNewsData = [
  {
    id: '1',
    title: 'Reliance Industries announces major expansion in renewable energy sector',
    company: 'Reliance Industries',
    timestamp: '2 hours ago',
    what: 'Reliance Industries has announced a ₹75,000 crore investment plan for expanding its renewable energy portfolio, including solar manufacturing and green hydrogen production facilities.',
    why: 'This strategic move positions Reliance to capitalize on India\'s energy transition goals and government incentives for clean energy. The investment could significantly boost long-term profitability and ESG credentials.',
    sentiment: 'bullish' as const,
    impact: 'high' as const,
    category: 'Strategic Investment'
  },
  {
    id: '2',
    title: 'TCS reports strong Q3 earnings with 15% YoY growth',
    company: 'Tata Consultancy Services',
    timestamp: '4 hours ago',
    what: 'TCS reported quarterly revenue of ₹58,229 crores, marking a 15% year-over-year growth. The company also announced new major client wins in the BFSI and retail sectors.',
    why: 'Strong earnings indicate robust demand for IT services globally. New client acquisitions suggest sustained growth momentum and market share expansion in key verticals.',
    sentiment: 'bullish' as const,
    impact: 'high' as const,
    category: 'Earnings Report'
  },
  {
    id: '3',
    title: 'HDFC Bank faces regulatory scrutiny over digital lending practices',
    company: 'HDFC Bank',
    timestamp: '6 hours ago',
    what: 'RBI has issued a notice to HDFC Bank regarding certain digital lending practices and has asked for clarification on compliance with new digital lending guidelines.',
    why: 'Regulatory scrutiny could lead to operational changes and potential penalties. However, proactive compliance improvements might strengthen long-term competitive position.',
    sentiment: 'bearish' as const,
    impact: 'medium' as const,
    category: 'Regulatory Update'
  },
  {
    id: '4',
    title: 'Infosys launches new AI-powered cloud platform for enterprises',
    company: 'Infosys',
    timestamp: '8 hours ago',
    what: 'Infosys unveiled "Topaz AI," a comprehensive AI-first platform that integrates cloud services, machine learning, and automation tools for enterprise clients.',
    why: 'This platform positions Infosys competitively in the high-growth AI and cloud services market, potentially driving higher-margin revenues and client stickiness.',
    sentiment: 'bullish' as const,
    impact: 'medium' as const,
    category: 'Product Launch'
  }
];

const Index = () => {
  const [newsData, setNewsData] = useState(mockNewsData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  // Filter news based on search and filters
  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'All Companies' || news.company === selectedCompany;
    const matchesSentiment = selectedSentiment === 'All' || 
                            news.sentiment.toLowerCase() === selectedSentiment.toLowerCase();
    
    return matchesSearch && matchesCompany && matchesSentiment;
  });

  // Calculate stats
  const bullishNews = newsData.filter(news => news.sentiment === 'bullish').length;
  const bearishNews = newsData.filter(news => news.sentiment === 'bearish').length;

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  // Auto-refresh every hour (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000); // Update timestamp every minute for demo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Market Intelligence</h2>
              <p className="text-gray-400 text-lg">AI-powered analysis of Nifty 50 news and market movements</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="glass-effect border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <StatsBar
          totalNews={newsData.length}
          bullishNews={bullishNews}
          bearishNews={bearishNews}
          lastUpdate={lastUpdate}
        />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedSentiment={selectedSentiment}
          setSelectedSentiment={setSelectedSentiment}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}

        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No news found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
