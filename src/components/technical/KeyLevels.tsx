
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface Level {
  level: number;
  type: string;
  strength: string;
}

interface KeyLevelsProps {
  levels: Level[];
}

const KeyLevels = ({ levels }: KeyLevelsProps) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-400" />
          <span>Key Levels</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {levels.map((level, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/20 rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${level.type === 'resistance' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                <span className="text-white font-medium">{level.level}</span>
                <span className="text-slate-400 text-sm capitalize">({level.type})</span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                level.strength === 'strong' ? 'bg-red-500/20 text-red-400' :
                level.strength === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {level.strength}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyLevels;
