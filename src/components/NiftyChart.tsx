
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const NiftyChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create TradingView widget script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "NSE:NIFTY",
      "interval": "D",
      "timezone": "Asia/Kolkata",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(15, 23, 42, 1)",
      "gridColor": "rgba(71, 85, 105, 0.3)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    });

    // Create the widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';
    
    const widgetContent = document.createElement('div');
    widgetContent.className = 'tradingview-widget-container__widget';
    widgetContent.style.height = 'calc(100% - 32px)';
    widgetContent.style.width = '100%';
    
    widgetContainer.appendChild(widgetContent);
    widgetContainer.appendChild(script);

    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
    }

    return () => {
      // Cleanup: remove scripts when component unmounts
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"]');
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

      {/* TradingView Chart Container */}
      <div className="h-96 md:h-[500px] mb-6 rounded-lg overflow-hidden bg-slate-900/50">
        <div 
          ref={containerRef}
          className="tradingview-widget-container h-full"
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

export default NiftyChart;
