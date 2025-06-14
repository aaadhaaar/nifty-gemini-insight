
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProfitWidget from '@/components/ProfitWidget';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import LoadingSpinner from '@/components/LoadingSpinner';
import UserProfile from '@/components/UserProfile';
import { BarChart3, Newspaper, Target, Menu, X } from 'lucide-react';
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

  // Strategic API call timing for maximum market impact coverage
  const getStrategicInterval = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Pre-market (7-9 AM) - High priority for overnight developments
    if (hour >= 7 && hour < 9) {
      return userActive ? 45 * 60 * 1000 : 90 * 60 * 1000; // 45min active, 90min inactive
    }
    // Market open (9-10 AM) - Critical opening hour
    else if (hour >= 9 && hour < 10) {
      return userActive ? 20 * 60 * 1000 : 40 * 60 * 1000; // 20min active, 40min inactive
    }
    // Morning session (10 AM-12 PM) - Active trading
    else if (hour >= 10 && hour < 12) {
      return userActive ? 30 * 60 * 1000 : 60 * 60 * 1000; // 30min active, 60min inactive
    }
    // Lunch break (12-1 PM) - Reduced frequency
    else if (hour >= 12 && hour < 13) {
      return userActive ? 60 * 60 * 1000 : 120 * 60 * 1000; // 60min active, 120min inactive
    }
    // Afternoon session (1-3:30 PM) - Active trading
    else if (hour >= 13 && hour < 15.5) {
      return userActive ? 25 * 60 * 1000 : 50 * 60 * 1000; // 25min active, 50min inactive
    }
    // Market close (3:30-4 PM) - Critical closing analysis
    else if (hour >= 15.5 && hour < 16) {
      return userActive ? 15 * 60 * 1000 : 30 * 60 * 1000; // 15min active, 30min inactive
    }
    // Post-market (4-6 PM) - Moderate for results/announcements
    else if (hour >= 16 && hour < 18) {
      return userActive ? 60 * 60 * 1000 : 120 * 60 * 1000; // 60min active, 120min inactive
    }
    // Evening (6-10 PM) - Global market watch
    else if (hour >= 18 && hour < 22) {
      return userActive ? 90 * 60 * 1000 : 180 * 60 * 1000; // 90min active, 180min inactive
    }
    // Night (10 PM-7 AM) - Very infrequent, overnight developments only
    else {
      return 240 * 60 * 1000; // 4 hours regardless of activity
    }
  };

  // Smart API call strategy with priority system
  const shouldMakeApiCall = () => {
    if (apiCallsToday >= 60) return false;
    if (!lastApiCall) return true; // First call of the session
    
    const now = new Date();
    const hour = now.getHours();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    const strategicInterval = getStrategicInterval();
    
    // Force calls during critical market periods regardless of interval
    const isCriticalPeriod = (
      (hour >= 9 && hour < 10) || // Market open
      (hour >= 15.5 && hour < 16) // Market close
    );
    
    if (isCriticalPeriod && timeSinceLastCall >= 15 * 60 * 1000 && userActive) {
      return true; // Force call every 15 minutes during critical periods
    }
    
    return timeSinceLastCall >= strategicInterval;
  };

  // Enhanced market data fetching with priority queuing
  const fetchMarketData = async () => {
    if (!shouldMakeApiCall()) {
      console.log('Skipping API call - strategic timing optimization');
      return;
    }

    if (apiCallsToday >= 60) {
      console.log('Daily API limit reached (60 calls) - strategic conservation mode');
      return;
    }

    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Priority-based search strategy
      let searchIntensity = 'standard';
      if ((hour >= 9 && hour < 10) || (hour >= 15.5 && hour < 16)) {
        searchIntensity = 'high'; // Market open/close
      } else if (hour >= 7 && hour < 9) {
        searchIntensity = 'pre-market'; // Pre-market focus
      } else if (hour >= 16 && hour < 18) {
        searchIntensity = 'post-market'; // Post-market analysis
      }
      
      console.log(`Strategic market fetch - ${searchIntensity} intensity (${apiCallsToday + 1}/60 calls)`);
      
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { searchIntensity, timeContext: hour }
      });
      
      if (error) {
        console.error('Error fetching strategic market data:', error);
      } else {
        console.log('Strategic market data result:', data);
        
        const newCallCount = apiCallsToday + 1;
        
        setLastApiCall(now);
        setApiCallsToday(newCallCount);
        
        // Store in localStorage
        localStorage.setItem('lastApiCall', now.toISOString());
        localStorage.setItem('apiCallsToday', newCallCount.toString());
        localStorage.setItem('lastApiCallDate', now.toDateString());
      }
    } catch (error) {
      console.error('Error in strategic fetch-news function:', error);
    }
  };

  // Intelligent auto-fetch system with market-aware scheduling
  useEffect(() => {
    // Strategic initial fetch based on market timing
    const checkStrategicFetch = () => {
      const storedDate = localStorage.getItem('lastApiCallDate');
      const today = new Date().toDateString();
      const hour = new Date().getHours();
      
      // Prioritize initial fetch during market hours
      const isMarketHours = hour >= 9 && hour <= 16;
      const shouldInitialFetch = (
        storedDate !== today && 
        apiCallsToday === 0 && 
        (isMarketHours || userActive)
      );
      
      if (shouldInitialFetch) {
        console.log('Strategic initial fetch triggered');
        fetchMarketData();
      }
    };

    checkStrategicFetch();

    // Market-aware interval checking
    const strategicInterval = setInterval(() => {
      if (shouldMakeApiCall() && (userActive || new Date().getHours() >= 9 && new Date().getHours() <= 16)) {
        fetchMarketData();
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(strategicInterval);
  }, [apiCallsToday, lastApiCall, userActive]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'impact', label: 'Analysis', icon: Target }
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
    if (apiCallsToday >= 60) return 'Tomorrow';
    
    const strategicInterval = getStrategicInterval();
    const nextCallTime = new Date(lastApiCall.getTime() + strategicInterval);
    const now = new Date();
    
    if (nextCallTime <= now) return 'Soon';
    
    const diffInMinutes = Math.floor((nextCallTime.getTime() - now.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours}h`;
  };

  const getApiEfficiency = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 16) return 'Market Hours - High Priority';
    if (hour >= 7 && hour < 9) return 'Pre-Market - Strategic';
    if (hour >= 16 && hour < 18) return 'Post-Market - Analysis';
    if (hour >= 18 && hour < 22) return 'Global Watch - Moderate';
    return 'Overnight - Minimal';
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
          </div>
        )}

        {/* Enhanced Strategic Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 p-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiCallsToday >= 55 ? 'bg-red-400' : 
                  apiCallsToday >= 40 ? 'bg-yellow-400' : 
                  apiCallsToday >= 20 ? 'bg-green-400' : 'bg-blue-400'
                }`}></div>
                <span className="text-xs text-slate-400">
                  {apiCallsToday}/60 • Last: {getTimeSinceLastCall()}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Next: {getNextCallTime()} • {userActive ? 'Active' : 'Idle'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-400">{getApiEfficiency()}</span>
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
