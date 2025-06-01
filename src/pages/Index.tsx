
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import NiftyChart from '@/components/NiftyChart';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import LoadingSpinner from '@/components/LoadingSpinner';
import { RefreshCw, BarChart3, Newspaper, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'news', label: 'Market News', icon: Newspaper },
    { id: 'impact', label: 'Impact Analysis', icon: Target }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold gradient-text mb-3">Nifty 50 Intelligence</h1>
              <p className="text-gray-400 text-xl">Real-time market analysis powered by AI</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              className="glass-effect border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 p-1 glass-effect rounded-xl mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8">
            {(activeTab === 'overview' || activeTab === 'chart') && (
              <NiftyChart />
            )}
            
            {(activeTab === 'overview' || activeTab === 'impact') && (
              <ImpactAnalysis />
            )}
            
            {(activeTab === 'overview' || activeTab === 'news') && (
              <MarketNews />
            )}
            
            {activeTab === 'news' && activeTab !== 'overview' && (
              <MarketNews />
            )}
            
            {activeTab === 'impact' && activeTab !== 'overview' && (
              <ImpactAnalysis />
            )}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Last updated: {lastUpdate} | Data refreshes every hour
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
