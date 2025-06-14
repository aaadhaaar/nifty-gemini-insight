
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
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { userActive, getStrategicInterval } = useStrategicTiming();
  const { lastApiCall, apiCallsToday } = useApiManagement(userActive, getStrategicInterval);

  // Auto-update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <AppNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

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

        <StatusBar
          lastApiCall={lastApiCall}
          apiCallsToday={apiCallsToday}
          userActive={userActive}
          getStrategicInterval={getStrategicInterval}
          lastUpdate={lastUpdate}
        />
      </main>
    </div>
  );
};

export default Index;
