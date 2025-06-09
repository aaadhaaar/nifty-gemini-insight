import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import NiftyChart from '@/components/NiftyChart';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BarChart3, Newspaper, Target, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [loading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Trigger initial market analysis fetch
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        console.log('Triggering market events fetch...');
        const { data, error } = await supabase.functions.invoke('fetch-news');
        if (error) {
          console.error('Error fetching market data:', error);
        } else {
          console.log('Market data fetch result:', data);
        }
      } catch (error) {
        console.error('Error calling fetch-news function:', error);
      }
    };

    // Trigger on load and then every 2 hours
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'impact', label: 'Analysis', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Nifty Insights</h1>
              <p className="text-xs text-slate-400">AI Market Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-slate-400">Auto-sync</span>
            </div>
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="sm"
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-800 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-700/50 md:hidden">
            <div className="grid grid-cols-3 gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t border-slate-700/50">
          <div className="flex space-x-1 p-2 max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === 'overview' && (
              <>
                <NiftyChart />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <ImpactAnalysis />
                  </div>
                  <div className="lg:col-span-2">
                    <MarketNews />
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'news' && <MarketNews />}
            
            {activeTab === 'impact' && <ImpactAnalysis />}
          </div>
        )}

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-slate-400">Market events auto-updating every 2 hours</span>
            </div>
            <span className="text-xs text-slate-400">
              Last refresh: {lastUpdate}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
