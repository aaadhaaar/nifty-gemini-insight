
import React from 'react';
import { BarChart3, Newspaper, Target, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';

interface AppNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const AppNavigation = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }: AppNavigationProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'impact', label: 'Analysis', icon: Target }
  ];

  return (
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
  );
};

export default AppNavigation;
