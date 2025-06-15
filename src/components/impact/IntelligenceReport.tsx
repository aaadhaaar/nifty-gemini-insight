
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

  const getPriorityLevel = (impact: number, confidence: number) => {
    const absImpact = Math.abs(impact);
    if (absImpact >= 2 && confidence >= 90) return 'CRITICAL';
    if (absImpact >= 1.5 && confidence >= 85) return 'HIGH';
    if (absImpact >= 1 && confidence >= 80) return 'MEDIUM';
    return 'LOW';
  };

  const formatText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    
    // Find the last complete sentence within the limit
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastQuestion = truncated.lastIndexOf('?');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastSentenceEnd > maxLength * 0.7) {
      return text.substring(0, lastSentenceEnd + 1);
    }
    
    // Fall back to word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? text.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const breakIntoPoints = (text: string) => {
    // Split by common separators and clean up
    const points = text
      .split(/[.!?]/)
      .map(point => point.trim())
      .filter(point => point.length > 20) // Filter out very short fragments
      .slice(0, 3); // Limit to 3 main points
    
    return points.length > 0 ? points : [formatText(text, 150)];
  };

  const impactStrength = getImpactStrength(item.expected_points_impact || 0);
  const impactDirection = getImpactDirection(item.expected_points_impact || 0);
  const impactColor = getImpactColor(item.expected_points_impact || 0);
  const impactBgColor = getImpactBgColor(item.expected_points_impact || 0);
  const priorityLevel = getPriorityLevel(item.expected_points_impact || 0, item.confidence_score || 0);
  const isHighPriority = priorityLevel === 'CRITICAL' || priorityLevel === 'HIGH';

  const summaryPoints = breakIntoPoints(item.what_happened);
  const impactPoints = breakIntoPoints(item.why_matters);
  const analysisPoints = item.market_impact_description ? breakIntoPoints(item.market_impact_description) : [];

  return (
    <div className={`border rounded-xl p-4 transition-all duration-300 ${
      isHighPriority ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-red-500/5 hover:bg-orange-500/10' : 
      'border-slate-700/50 hover:bg-slate-700/30'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-3 sm:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getUrgencyIcon(item.expected_points_impact || 0)}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              priorityLevel === 'CRITICAL' ? 'bg-red-500/30 text-red-300' :
              priorityLevel === 'HIGH' ? 'bg-orange-500/30 text-orange-300' :
              priorityLevel === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-300' :
              'bg-blue-500/30 text-blue-300'
            }`}>
              {priorityLevel} PRIORITY
            </span>
            <span className="text-xs text-slate-400">Report #{index + 1}</span>
            <span className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleTimeString()}
            </span>
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
            <span className="text-xs font-medium text-blue-300">Key Intelligence</span>
          </div>
          <div className="space-y-2">
            {summaryPoints.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-blue-400 text-xs mt-1">•</span>
                <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-300">Strategic Impact</span>
          </div>
          <div className="space-y-2">
            {impactPoints.map((point, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-purple-400 text-xs mt-1">•</span>
                <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {analysisPoints.length > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium text-orange-300">Market Analysis</span>
            </div>
            <div className="space-y-2">
              {analysisPoints.map((point, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-orange-400 text-xs mt-1">•</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceReport;
