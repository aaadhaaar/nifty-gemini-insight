
import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from './UserProfile';
import TabNavigation from './TabNavigation';

interface Stock {
  symbol: string;
}

interface MainHeaderProps {
  selectedStock: Stock;
  isRefreshing: boolean;
  apiCallsToday: number;
  handleManualRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  selectedStock,
  isRefreshing,
  apiCallsToday,
  handleManualRefresh,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">The Undercurrent</h1>
            <p className="text-xs text-slate-400">AI Stock Analysis • {selectedStock.symbol}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <UserProfile />
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing || apiCallsToday >= 60}
            size="sm"
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>
      </div>

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </div>
  );
};

export default MainHeader;
