
import React, { useEffect } from 'react';

const ProfitWidget = () => {
  useEffect(() => {
    // Add the message listener for the widget
    const handleMessage = (msg: MessageEvent) => {
      const widget = document.getElementById('MiniChartWidget-u3t49oz');
      
      if (!widget) return;
      
      const styles = msg.data?.styles;
      const token = msg.data?.token;
      const urlToken = new URL((widget as HTMLIFrameElement).src)?.searchParams?.get?.('token');
      if (styles && token === urlToken) {
        Object.keys(styles).forEach(key => 
          widget.style.setProperty(key, styles[key])
        );
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Market Chart</h2>
        <div className="text-slate-400 text-sm">
          Live market data from Profit.com
        </div>
      </div>
      
      <div className="flex justify-center">
        <iframe
          style={{
            border: 'none',
            width: '375px',
            height: '202px',
            borderRadius: '12px'
          }}
          data-widget-name="MiniChartWidget"
          src="https://widget.darqube.com/mini-chart-widget?token=673488bbcfce33d56834bcfc"
          id="MiniChartWidget-u3t49oz"
          title="Profit.com Market Widget"
        />
      </div>
    </div>
  );
};

export default ProfitWidget;
