
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const NiftyChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create the Finlogix container
    const finlogixContainer = document.createElement('div');
    finlogixContainer.className = 'finlogix-container';

    // Create and load the Finlogix script
    const widgetScript = document.createElement('script');
    widgetScript.type = 'text/javascript';
    widgetScript.src = 'https://widget.finlogix.com/Widget.js';
    
    widgetScript.onload = () => {
      // Initialize the widget after the script loads
      if (window.Widget) {
        window.Widget.init({
          widgetId: "4addd754-ee90-475f-9eb5-31110d1ab21a",
          type: "SingleSymbol",
          language: "en",
          showBrand: true,
          isShowTradeButton: true,
          isShowBeneathLink: true,
          isShowDataFromACYInfo: true,
          symbolName: "INDIA50",
          withButton: false,
          isAdaptive: true
        });
      }
    };

    if (containerRef.current) {
      containerRef.current.appendChild(finlogixContainer);
      document.head.appendChild(widgetScript);
    }

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector('script[src="https://widget.finlogix.com/Widget.js"]');
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

      {/* Finlogix Chart Container */}
      <div className="h-96 md:h-[500px] mb-6 rounded-lg overflow-hidden bg-slate-900/50">
        <div 
          ref={containerRef}
          className="finlogix-widget-container h-full"
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

// Extend the Window interface to include the Widget object
declare global {
  interface Window {
    Widget: {
      init: (config: {
        widgetId: string;
        type: string;
        language: string;
        showBrand: boolean;
        isShowTradeButton: boolean;
        isShowBeneathLink: boolean;
        isShowDataFromACYInfo: boolean;
        symbolName: string;
        withButton: boolean;
        isAdaptive: boolean;
      }) => void;
    };
  }
}

export default NiftyChart;
