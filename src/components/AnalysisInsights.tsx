
import React from 'react';
import { Brain } from 'lucide-react';
import { ImpactAnalysisData } from '@/hooks/useImpactAnalysis';
import AnalysisInsightCard from './AnalysisInsightCard';

interface AnalysisInsightsProps {
  analysisData: ImpactAnalysisData[];
}

const AnalysisInsights: React.FC<AnalysisInsightsProps> = ({ analysisData }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
        <Brain className="w-5 h-5 text-orange-400" />
        <span>Live Market Insights</span>
      </h3>
      
      <div className="grid gap-4">
        {analysisData.slice(0, 4).map((analysis) => (
          <AnalysisInsightCard key={analysis.id} analysis={analysis} />
        ))}
      </div>
    </div>
  );
};

export default AnalysisInsights;
