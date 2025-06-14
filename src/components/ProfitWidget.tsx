
import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfitWidget = () => {
  const [widgetError, setWidgetError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Add the message listener for the widget - exactly like your working code
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

    // Use window.top like in your working code
    window.top?.addEventListener("message", handleMessage);

    // Much more lenient error detection - only trigger if widget completely fails to load
    const errorTimeout = setTimeout(() => {
      const widget = document.getElementById('MiniChartWidget-u3t49oz') as HTMLIFrameElement;
      if (widget) {
        // Only set error if the iframe src is empty or widget is completely broken
        widget.onerror = () => {
          console.log('Widget failed to load');
          setWidgetError(true);
        };
      }
    }, 10000); // Wait 10 seconds before even checking

    return () => {
      if (window.top) {
        window.top.removeEventListener("message", handleMessage);
      }
      clearTimeout(errorTimeout);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setWidgetError(false);
    
    // Force refresh the iframe
    const widget = document.getElementById('MiniChartWidget-u3t49oz') as HTMLIFrameElement;
    if (widget) {
      const currentSrc = widget.src;
      widget.src = '';
      setTimeout(() => {
        widget.src = currentSrc;
        setIsRefreshing(false);
      }, 100);
    }
  };

  if (widgetError) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Market Chart</h2>
          <div className="text-slate-400 text-sm">
            Live market data from Profit.com
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-orange-400" />
          <div className="text-center">
            <p className="text-white font-medium mb-2">Widget Unavailable</p>
            <p className="text-slate-400 text-sm mb-4">
              The market widget is temporarily unavailable. Please try refreshing or check back later.
            </p>
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
