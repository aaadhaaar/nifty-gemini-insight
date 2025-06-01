
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
    <div className="glass-effect rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Nifty 50</h2>
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-white">{currentPrice.toLocaleString()}</span>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 text-gray-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Live Market</span>
          </div>
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={niftyData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={3}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300 mb-1">Day High</p>
          <p className="text-lg font-semibold text-white">₹20,180</p>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-300 mb-1">Day Low</p>
          <p className="text-lg font-semibold text-white">₹19,820</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Volume</p>
          <p className="text-lg font-semibold text-white">2.4M</p>
        </div>
      </div>
    </div>
  );
};

export default NiftyChart;
