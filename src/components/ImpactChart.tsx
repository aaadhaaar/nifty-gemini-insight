
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
  
  const getImpactStrength = (value: number): string => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'Very Strong';
    if (absValue >= 0.6) return 'Strong';
    if (absValue >= 0.3) return 'Moderate';
    if (absValue >= 0.1) return 'Weak';
    return 'Very Weak';
  };

  const getImpactDirection = (value: number): string => {
    if (value > 0.1) return 'Positive';
    if (value < -0.1) return 'Negative';
    return 'Neutral';
  };

  const getIcon = (value: number) => {
    if (value > 0.1) return <TrendingUp className="w-4 h-4" />;
    if (value < -0.1) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getColor = (value: number): string => {
    if (value > 0.1) return '#10b981'; // emerald-500
    if (value < -0.1) return '#ef4444'; // red-500
    return '#eab308'; // yellow-500
  };

  const getTextColor = (value: number): string => {
    if (value > 0.1) return 'text-emerald-400';
    if (value < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Market Impact Trend</h3>
          <p className="text-sm text-slate-400">Cumulative impact strength over time</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          currentImpact > 0.1 ? 'bg-emerald-500/20 text-emerald-400' : 
          currentImpact < -0.1 ? 'bg-red-500/20 text-red-400' : 
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {getIcon(currentImpact)}
          <span className="font-medium">
            {getImpactStrength(currentImpact)}
          </span>
          <span className="text-slate-400">•</span>
          <span className="font-medium">
            {getImpactDirection(currentImpact)}
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
              domain={[-1, 1]}
              tickFormatter={(value) => {
                if (value >= 0.8) return 'Very Strong';
                if (value >= 0.6) return 'Strong';
                if (value >= 0.3) return 'Moderate';
                if (value >= 0.1) return 'Weak';
                if (value >= -0.1) return 'Neutral';
                if (value >= -0.3) return 'Weak';
                if (value >= -0.6) return 'Moderate';
                if (value >= -0.8) return 'Strong';
                return 'Very Strong';
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value: number) => {
                const strength = getImpactStrength(value);
                const direction = getImpactDirection(value);
                return [`${strength} ${direction}`, 'Impact'];
              }}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="cumulativeImpact"
              stroke={getColor(currentImpact)}
              strokeWidth={2}
              dot={{ fill: getColor(currentImpact), strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: getColor(currentImpact) }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ImpactChart;
