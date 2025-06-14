
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Pattern {
  name: string;
  timeframe: string;
  probability: number;
  target: number;
}

interface ChartPatternsProps {
  patterns: Pattern[];
}

const ChartPatterns = ({ patterns }: ChartPatternsProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span>Chart Patterns</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <div key={index} className="p-3 bg-slate-700/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{pattern.name}</h4>
                <span className="text-slate-400 text-sm">{pattern.timeframe}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-slate-400 text-xs">Probability</p>
                    <p className="text-green-400 font-medium">{pattern.probability}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Target</p>
                    <p className="text-blue-400 font-medium">{pattern.target}</p>
                  </div>
                </div>
                <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${pattern.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartPatterns;
