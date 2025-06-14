
import React, { useState, useEffect } from 'react';
import ProfitWidget from '@/components/ProfitWidget';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MarketNews from '@/components/MarketNews';
import TechnicalAnalysis from '@/components/TechnicalAnalysis';
import LoadingSpinner from '@/components/LoadingSpinner';
import StockSearch from '@/components/StockSearch';
import MainHeader from '@/components/MainHeader';
import StatusBar from '@/components/StatusBar';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock>({
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    sector: 'Oil & Gas'
  });

  const {
    lastApiCall,
    isRefreshing,
    apiCallsToday,
    userActive,
    handleManualRefresh
  } = useSmartRefresh();

  // Auto-update timestamp every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MainHeader
        selectedStock={selectedStock}
        isRefreshing={isRefreshing}
        apiCallsToday={apiCallsToday}
        handleManualRefresh={handleManualRefresh}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <StockSearch selectedStock={selectedStock} onStockSelect={setSelectedStock} />
            
            {activeTab === 'overview' && (
              <>
                <ProfitWidget />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <ImpactAnalysis selectedStock={selectedStock} />
                  </div>
                  <div className="lg:col-span-2">
                    <MarketNews selectedStock={selectedStock} />
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'news' && <MarketNews selectedStock={selectedStock} />}
            
            {activeTab === 'impact' && <ImpactAnalysis selectedStock={selectedStock} />}
            
            {activeTab === 'technical' && <TechnicalAnalysis selectedStock={selectedStock} />}
          </div>
        )}

        <StatusBar
          isRefreshing={isRefreshing}
          apiCallsToday={apiCallsToday}
          lastApiCall={lastApiCall}
          userActive={userActive}
          selectedStock={selectedStock}
          lastUpdate={lastUpdate}
        />
      </main>
    </div>
  );
};

export default Index;
