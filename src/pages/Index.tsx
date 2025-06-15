import React, { useState, useEffect } from 'react';
import ProfitWidget from '@/components/ProfitWidget';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import LoadingSpinner from '@/components/LoadingSpinner';
import AppNavigation from '@/components/AppNavigation';
import StatusBar from '@/components/StatusBar';
import { useStrategicTiming } from '@/hooks/useStrategicTiming';
import { useApiManagement } from '@/hooks/useApiManagement';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { userActive, getStrategicInterval } = useStrategicTiming();
  const { lastApiCall, apiCallsToday } = useApiManagement(userActive, getStrategicInterval);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Auto-update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-slate-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-purple-900/10" />
      
      {/* Floating orbs for ambiance */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10">
        <AppNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="p-6 pb-24">
          {loading ? (
            <div className="flex items-center justify-center min-h-[70vh]">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="animate-slide-up">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="animate-fade-in">
                      <ProfitWidget />
                    </div>
                    <div className="grid gap-8 lg:grid-cols-1">
                      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <ImpactAnalysis />
                      </div>
                      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <MarketNews />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'news' && (
                  <div className="animate-fade-in">
                    <MarketNews />
                  </div>
                )}
                
                {activeTab === 'impact' && (
                  <div className="animate-fade-in">
                    <ImpactAnalysis />
                  </div>
                )}
              </div>
            </div>
          )}
          <StatusBar
            lastApiCall={lastApiCall}
            apiCallsToday={apiCallsToday}
            userActive={userActive}
            getStrategicInterval={getStrategicInterval}
            lastUpdate={lastUpdate}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
