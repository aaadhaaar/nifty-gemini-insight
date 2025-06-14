import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProfitWidget from '@/components/ProfitWidget';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import TechnicalAnalysis from '@/components/TechnicalAnalysis';
import LoadingSpinner from '@/components/LoadingSpinner';
import UserProfile from '@/components/UserProfile';
import { BarChart3, Newspaper, Target, Menu, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastApiCall, setLastApiCall] = useState<Date | null>(null);
  const [apiCallsToday, setApiCallsToday] = useState(0);
  const [userActive, setUserActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());

  // Load stored data on mount
  useEffect(() => {
    const storedLastCall = localStorage.getItem('lastApiCall');
    const storedCallsToday = localStorage.getItem('apiCallsToday');
    const storedDate = localStorage.getItem('lastApiCallDate');
    
    const today = new Date().toDateString();
    
    if (storedLastCall && storedDate === today) {
      setLastApiCall(new Date(storedLastCall));
      setApiCallsToday(parseInt(storedCallsToday || '0', 10));
    } else {
      // Reset daily counter if it's a new day
      localStorage.setItem('apiCallsToday', '0');
      localStorage.setItem('lastApiCallDate', today);
      setApiCallsToday(0);
    }
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setUserActive(true);
      setLastActivity(new Date());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check for inactivity every minute
    const inactivityTimer = setInterval(() => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      const tenMinutes = 10 * 60 * 1000;
      
      if (timeSinceActivity > tenMinutes) {
        setUserActive(false);
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityTimer);
    };
  }, [lastActivity]);

  // Auto-update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Conservative interval calculation for free tier optimization
  const getOptimizedInterval = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Market hours (9 AM to 4 PM IST) - moderate frequency only if user is active
    if (hour >= 9 && hour <= 16) {
      return userActive ? 2 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000; // 2hr active, 4hr inactive
    }
    // Evening (5 PM to 10 PM) - less frequent
    else if (hour >= 17 && hour <= 22) {
      return userActive ? 4 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 4hr active, 8hr inactive
    }
    // Night (11 PM to 8 AM) - very infrequent
    else {
      return 12 * 60 * 60 * 1000; // 12 hours regardless of activity
    }
  };

  // Conservative API call limits for free tier
  const shouldMakeApiCall = () => {
    if (apiCallsToday >= 60) return false; // Updated daily limit to 60
    if (!lastApiCall) return true; // First call of the session
    
    const now = new Date();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    const optimizedInterval = getOptimizedInterval();
    
    return timeSinceLastCall >= optimizedInterval;
  };

  // Function to fetch market data
  const fetchMarketData = async () => {
    if (!shouldMakeApiCall()) {
      console.log('Skipping API call - conserving usage');
      return;
    }

    if (apiCallsToday >= 60) {
      console.log('Daily API limit reached (60 calls)');
      return;
    }

    try {
      console.log('Triggering optimized market events fetch...');
      
      const { data, error } = await supabase.functions.invoke('fetch-news');
      if (error) {
        console.error('Error fetching market data:', error);
      } else {
        console.log('Market data fetch result:', data);
        
        const now = new Date();
        const newCallCount = apiCallsToday + 1;
        
        setLastApiCall(now);
        setApiCallsToday(newCallCount);
        
        // Store in localStorage
        localStorage.setItem('lastApiCall', now.toISOString());
        localStorage.setItem('apiCallsToday', newCallCount.toString());
        localStorage.setItem('lastApiCallDate', now.toDateString());
      }
    } catch (error) {
      console.error('Error calling fetch-news function:', error);
    }
  };

  // Smart auto-fetch system optimized for free tier
  useEffect(() => {
    // Initial check - only fetch if really needed and no recent data
    const checkInitialFetch = () => {
      const storedDate = localStorage.getItem('lastApiCallDate');
      const today = new Date().toDateString();
      
      // Only fetch on first load if no data from today and user is active
      if (storedDate !== today && apiCallsToday === 0 && userActive) {
        fetchMarketData();
      }
    };

    checkInitialFetch();

    // Set up conservative interval checking
    const smartInterval = setInterval(() => {
      if (shouldMakeApiCall() && userActive) {
        fetchMarketData();
      }
    }, 60 * 60 * 1000); // Check every hour instead of 30 minutes

    return () => clearInterval(smartInterval);
  }, [apiCallsToday, lastApiCall, userActive]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'impact', label: 'Analysis', icon: Target },
    { id: 'technical', label: 'Technical', icon: TrendingUp }
  ];

  const getTimeSinceLastCall = () => {
    if (!lastApiCall) return 'Never';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastApiCall.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h ago`;
  };

  const getNextCallTime = () => {
    if (!lastApiCall) return 'Soon';
    if (apiCallsToday >= 60) return 'Tomorrow'; // Updated limit check
    
    const optimizedInterval = getOptimizedInterval();
    const nextCallTime = new Date(lastApiCall.getTime() + optimizedInterval);
    const now = new Date();
    
    if (nextCallTime <= now) return 'Soon';
    
    const diffInMinutes = Math.floor((nextCallTime.getTime() - now.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  };

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
              <h1 className="text-lg font-bold text-white">The Undercurrent</h1>
              <p className="text-xs text-slate-400">AI Market Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserProfile />
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
            <div className="grid grid-cols-4 gap-1 p-2">
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
          <div className="flex space-x-1 p-2 max-w-lg mx-auto">
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
                <ProfitWidget />
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
            
            {activeTab === 'technical' && <TechnicalAnalysis />}
          </div>
        )}

        {/* Optimized Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiCallsToday >= 60 ? 'bg-red-400' : apiCallsToday >= 40 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                <span className="text-xs text-slate-400">
                  {apiCallsToday}/60 calls • Last: {getTimeSinceLastCall()}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Next: {getNextCallTime()} • {userActive ? 'Active' : 'Idle'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-400">Free Tier</span>
              <span className="text-xs text-slate-400">
                UI: {lastUpdate}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
