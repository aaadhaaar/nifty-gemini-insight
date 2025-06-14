
import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  marketCap?: string;
}

interface StockSearchProps {
  selectedStock: Stock;
  onStockSelect: (stock: Stock) => void;
}

const NIFTY_50_STOCKS: Stock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT Services' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Paints' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobiles' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharmaceuticals' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Goods' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT Services' },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation Ltd', sector: 'Oil & Gas' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Power' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Financial Services' },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Ltd', sector: 'Pharmaceuticals' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT Services' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Diversified' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Steel' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobiles' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Financial Services' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT Services' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Steel' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobiles' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare' },
  { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', sector: 'Pharmaceuticals' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharmaceuticals' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Diversified' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Oil & Gas' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobiles' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance' },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd', sector: 'Financial Services' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure' },
  { symbol: 'UPL', name: 'UPL Ltd', sector: 'Agrochemicals' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT Services' },
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Automobiles' }
];

const StockSearch: React.FC<StockSearchProps> = ({ selectedStock, onStockSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = NIFTY_50_STOCKS.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(NIFTY_50_STOCKS);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStockSelect = (stock: Stock) => {
    onStockSelect(stock);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSectorColor = (sector: string) => {
    const colors = {
      'Banking': 'bg-blue-500/20 text-blue-300',
      'IT Services': 'bg-purple-500/20 text-purple-300',
      'FMCG': 'bg-green-500/20 text-green-300',
      'Oil & Gas': 'bg-orange-500/20 text-orange-300',
      'Pharmaceuticals': 'bg-pink-500/20 text-pink-300',
      'Automobiles': 'bg-red-500/20 text-red-300',
      'Infrastructure': 'bg-yellow-500/20 text-yellow-300',
      'Power': 'bg-cyan-500/20 text-cyan-300'
    };
    return colors[sector as keyof typeof colors] || 'bg-slate-500/20 text-slate-300';
  };

  return (
    <div ref={searchRef} className="relative mb-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Stock Analysis</h2>
              <p className="text-sm text-slate-400">Search & analyze any Nifty 50 stock</p>
            </div>
          </div>
        </div>

        {/* Current Selection */}
        <div className="mb-4 p-3 bg-slate-700/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-semibold text-white">{selectedStock.symbol}</h3>
                <p className="text-sm text-slate-400">{selectedStock.name}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSectorColor(selectedStock.sector)}`}>
              {selectedStock.sector}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks by name, symbol, or sector..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              className="ml-2 bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
              <div className="p-2">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock)}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {stock.symbol.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{stock.symbol}</p>
                          <p className="text-sm text-slate-400 truncate max-w-48">{stock.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSectorColor(stock.sector)}`}>
                        {stock.sector}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">
                    No stocks found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;
