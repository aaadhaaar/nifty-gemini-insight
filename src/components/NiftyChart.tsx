
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const NiftyChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create the widget script for Stock Target Advisor
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.stocktargetadvisor.com/widgets/js/widget.js';
    script.async = true;
    
    script.onload = () => {
      // Initialize the widget once script is loaded
      if (window.STAWidget) {
        window.STAWidget.init({
          container: containerRef.current,
          symbol: 'NIFTY',
          market: 'NSE',
          width: '100%',
          height: '100%',
          theme: 'dark',
          type: 'chart'
        });
      }
    };

    // Append script to head
    document.head.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // Remove script from head
      const existingScript = document.querySelector('script[src="https://www.stocktargetadvisor.com/widgets/js/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Nifty 50</h2>
          <div className="flex items-center space-x-2 text-slate-400">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Live Chart</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 md:h-[500px] mb-6 rounded-lg overflow-hidden bg-slate-900/50">
        <div 
          ref={containerRef}
          className="sta-chart-widget h-full w-full"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 md:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs md:text-sm text-blue-300 mb-1">Market</p>
          <p className="text-sm md:text-lg font-semibold text-white">NSE</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-xs md:text-sm text-green-300 mb-1">Index</p>
          <p className="text-sm md:text-lg font-semibold text-white">Nifty 50</p>
        </div>
        <div className="p-3 md:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs md:text-sm text-purple-300 mb-1">Currency</p>
          <p className="text-sm md:text-lg font-semibold text-white">INR</p>
        </div>
      </div>
    </div>
  );
};

// Extend window object to include STAWidget
declare global {
  interface Window {
    STAWidget: {
      init: (config: {
        container: HTMLElement | null;
        symbol: string;
        market: string;
        width: string;
        height: string;
        theme: string;
        type: string;
      }) => void;
    };
  }
}

export default NiftyChart;
