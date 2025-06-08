
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ImpactDataPoint {
  time: string;
  cumulativeImpact: number;
  articleCount: number;
}

interface ImpactChartProps {
  data: ImpactDataPoint[];
}

const ImpactChart = ({ data }: ImpactChartProps) => {
  const currentImpact = data[data.length - 1]?.cumulativeImpact || 0;
  const isPositive = currentImpact >= 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Market Impact Trend</h3>
          <p className="text-sm text-slate-400">Cumulative points impact over time</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-medium">
            {isPositive ? '+' : ''}{currentImpact} pts
          </span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={11}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value} pts`, 'Impact']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="cumulativeImpact"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={{ fill: isPositive ? "#10b981" : "#ef4444", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: isPositive ? "#10b981" : "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImpactChart;
