
import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const NiftyChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create DarQube widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'darqube-widget-container';
    
    // Create the widget HTML
    widgetContainer.innerHTML = `
      <iframe 
        style="border: none; width: 100%; height: 100%;" 
        data-widget-name="AdvancedChartWidget" 
        src="https://widget.darqube.com/advanced-chart-widget?token=684dbc1284490f9273764e0d" 
        id="AdvancedChartWidget-bvs4qly"
      ></iframe>
    `;

    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
      
      // Add the message listener script
      const script = document.createElement('script');
      script.innerHTML = `
        window.top.addEventListener("message", function(msg) {
          const widget = document.getElementById('AdvancedChartWidget-bvs4qly');
          
          if (!widget) return;
          
          const styles = msg.data?.styles;
          const token = msg.data?.token;
          const urlToken = new URL(widget.src)?.searchParams?.get?.('token');
          if (styles && token === urlToken) {
            Object.keys(styles).forEach(key => widget.style.setProperty(key, styles[key]))
          }
        });
      `;
      
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup when component unmounts
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
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
          className="darqube-widget-container h-full"
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
