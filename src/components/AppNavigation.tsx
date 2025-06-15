
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
    { id: 'news', label: 'Market', icon: Newspaper },
    { id: 'impact', label: 'Analysis', icon: Target }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-white/5">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center glow-subtle transition-all duration-300 group-hover:scale-105">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">The Undercurrent</h1>
            <p className="text-xs text-slate-400 font-medium">AI Market Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <UserProfile />
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            size="sm"
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-white/10 md:hidden transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-white/5 md:hidden animate-slide-up">
          <div className="grid grid-cols-3 gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center space-y-2 p-4 rounded-xl transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:block border-t border-white/5">
        <div className="flex justify-center p-4">
          <div className="flex space-x-2 p-1 rounded-2xl bg-white/5 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg glow-subtle'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavigation;
