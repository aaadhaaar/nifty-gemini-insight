
import React from 'react';
import { TrendingUp, TrendingDown, Activity, Zap, Target, Brain, Flame, AlertTriangle } from 'lucide-react';
import { ImpactAnalysisData } from '@/hooks/useImpactAnalysis';

interface IntelligenceReportProps {
  item: ImpactAnalysisData;
  index: number;
  getImpactStrength: (value: number) => string;
  getImpactDirection: (value: number) => string;
  getImpactColor: (value: number) => string;
  getImpactBgColor: (value: number) => string;
}

const IntelligenceReport: React.FC<IntelligenceReportProps> = ({
  item,
  index,
  getImpactStrength,
  getImpactDirection,
  getImpactColor,
  getImpactBgColor
}) => {
  const getUrgencyIcon = (impact: number) => {
    const absImpact = Math.abs(impact);
    if (absImpact >= 2) return <Flame className="w-4 h-4 text-red-400 animate-pulse" />;
    if (absImpact >= 1) return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    return <Activity className="w-4 h-4 text-blue-400" />;
  };

  const impactStrength = getImpactStrength(item.expected_points_impact || 0);
  const impactDirection = getImpactDirection(item.expected_points_impact || 0);
  const impactColor = getImpactColor(item.expected_points_impact || 0);
  const impactBgColor = getImpactBgColor(item.expected_points_impact || 0);
  const isHighImpact = Math.abs(item.expected_points_impact || 0) >= 1.5;

  return (
    <div className={`border rounded-xl p-4 transition-all duration-300 ${
      isHighImpact ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-red-500/5 hover:bg-orange-500/10' : 
      'border-slate-700/50 hover:bg-slate-700/30'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getUrgencyIcon(item.expected_points_impact || 0)}
            <span className="text-xs text-slate-400">Intelligence Report #{index + 1}</span>
            <span className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleTimeString()}
            </span>
            {isHighImpact && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium animate-pulse">
                HIGH IMPACT
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs border ${impactBgColor}`}>
            {(item.expected_points_impact || 0) >= 0.5 ? <TrendingUp className="w-3 h-3" /> : 
             (item.expected_points_impact || 0) <= -0.5 ? <TrendingDown className="w-3 h-3" /> : 
             <Activity className="w-3 h-3" />}
            <span className={`font-medium ${impactColor}`}>
              {impactStrength}
            </span>
            <span className="text-slate-400">•</span>
            <span className={`font-medium ${impactColor}`}>
              {impactDirection}
            </span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
            (item.confidence_score || 0) >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
            (item.confidence_score || 0) >= 80 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
            'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {item.confidence_score || 0}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Intelligence Summary</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{item.what_happened}</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">Strategic Impact</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{item.why_matters}</p>
        </div>

        {item.market_impact_description && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-orange-300">Competitive Analysis</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{item.market_impact_description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceReport;
