
import React from 'react';

const TechnicalAnalysis = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 my-6">
      <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center space-x-2">
        <span>📊</span>
        <span>Market Undercurrents &amp; Event Intelligence</span>
      </h2>
      <div className="text-slate-300 text-sm leading-relaxed mb-4">
        <strong className="text-orange-400">
          This dashboard now prioritizes event-driven market intelligence instead of technical chart analysis.
        </strong>
        <br /><br />
        You'll see impactful recent events, sector rotations, FII/DII institutional flows, policy dynamics, and strategic undercurrents &mdash; <b>not</b> just price levels or chart patterns.<br /><br/>
        Review the <span className="text-yellow-300 font-semibold">Competitive Intelligence</span> dashboard below for real-time market-moving events, hidden sector flows, and developments that matter.
      </div>
      <div className="px-4 py-2 bg-yellow-500/10 border-l-4 border-yellow-400 rounded">
        <span className="text-yellow-400 font-medium">Looking for technicals?</span>  
        <br />
        This section intentionally excludes support, resistance, RSI, or chart pattern data. Use the "Competitive Intelligence" dashboard for actionable market events and strategic shifts.
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
