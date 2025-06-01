
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// Mock Nifty 50 data - in real app, this would come from API
const niftyData = [
  { time: '09:00', price: 19850, volume: 1200 },
  { time: '10:00', price: 19920, volume: 1450 },
  { time: '11:00', price: 19880, volume: 1300 },
  { time: '12:00', price: 19950, volume: 1600 },
  { time: '13:00', price: 20020, volume: 1800 },
  { time: '14:00', price: 19980, volume: 1500 },
  { time: '15:00', price: 20100, volume: 2100 },
  { time: '15:30', price: 20150, volume: 2400 },
];

const NiftyChart = () => {
  const currentPrice = niftyData[niftyData.length - 1].price;
  const previousPrice = niftyData[niftyData.length - 2].price;
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);
  const isPositive = change >= 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Nifty 50</h2>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-2xl md:text-3xl font-bold text-white">{currentPrice.toLocaleString()}</span>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-slate-400">
          <Activity className="w-4 h-4" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={niftyData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              domain={['dataMin - 50', 'dataMax + 50']}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px'
              }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs md:text-sm text-blue-300 mb-1">Day High</p>
          <p className="text-sm md:text-lg font-semibold text-white">₹20,180</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs md:text-sm text-red-300 mb-1">Day Low</p>
          <p className="text-sm md:text-lg font-semibold text-white">₹19,820</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs md:text-sm text-purple-300 mb-1">Volume</p>
          <p className="text-sm md:text-lg font-semibold text-white">2.4M</p>
        </div>
      </div>
    </div>
  );
};

export default NiftyChart;
