
import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  selectedSentiment: string;
  setSelectedSentiment: (sentiment: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCompany,
  setSelectedCompany,
  selectedSentiment,
  setSelectedSentiment
}) => {
  const nifty50Companies = [
    'All Companies', 'Reliance', 'TCS', 'HDFC Bank', 'Infosys', 'Hindustan Unilever',
    'ICICI Bank', 'Kotak Mahindra Bank', 'SBI', 'Bharti Airtel', 'ITC'
  ];

  const sentiments = ['All', 'Bullish', 'Bearish', 'Neutral'];

  return (
    <div className="glass-effect rounded-2xl p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 pr-10 min-w-[160px]"
            >
              {nifty50Companies.map((company) => (
                <option key={company} value={company} className="bg-gray-800">
                  {company}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 pr-10 min-w-[120px]"
            >
              {sentiments.map((sentiment) => (
                <option key={sentiment} value={sentiment} className="bg-gray-800">
                  {sentiment}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <Button
            variant="outline"
            className="glass-effect border-white/10 text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
