
import React from 'react';
import { ImpactAnalysisData } from '@/hooks/useImpactAnalysis';
import { 
  getImpactColor, 
  getImpactStatusColor, 
  getImpactStatusText, 
  getImpactStatusTextColor 
} from '@/utils/impactAnalysisUtils';

interface AnalysisInsightCardProps {
  analysis: ImpactAnalysisData;
}

const AnalysisInsightCard: React.FC<AnalysisInsightCardProps> = ({ analysis }) => {
  return (
    <div className={`p-4 rounded-xl border ${getImpactColor(analysis.expected_points_impact)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getImpactStatusColor(analysis.expected_points_impact)}`}></div>
          <span className={`text-xs font-medium ${getImpactStatusTextColor(analysis.expected_points_impact)}`}>
            {getImpactStatusText(analysis.expected_points_impact)} IMPACT
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>{analysis.confidence_score}% confidence</span>
          <span>•</span>
          <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <h4 className="font-semibold text-white mb-2 text-sm">
        {analysis.what_happened}
      </h4>
      
      <p className="text-sm text-slate-300 mb-3">
        {analysis.why_matters}
      </p>
      
      <div className="pt-2 border-t border-slate-600/30">
        <p className="text-xs text-slate-400">
          <span className="font-medium">Market Impact:</span> {analysis.market_impact_description}
        </p>
      </div>
    </div>
  );
};

export default AnalysisInsightCard;
