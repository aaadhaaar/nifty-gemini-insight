
import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfitWidget = () => {
  const [widgetError, setWidgetError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the right route - widget should only work on main app
    const currentPath = window.location.pathname;
    if (currentPath !== '/') {
      console.log('Widget not loading - not on main route');
      setWidgetError(true);
      setIsLoading(false);
      return;
    }

    // Add the message listener for the widget
    const handleMessage = (msg: MessageEvent) => {
      console.log('Widget message received:', msg.data);
      const widget = document.getElementById('MiniChartWidget-84mnii1');
      
      if (!widget) return;
      
      const styles = msg.data?.styles;
      const token = msg.data?.token;
      const urlToken = new URL((widget as HTMLIFrameElement).src)?.searchParams?.get?.('token');
      
      if (styles && token === urlToken) {
        Object.keys(styles).forEach(key => 
          widget.style.setProperty(key, styles[key])
        );
        setIsLoading(false);
        console.log('Widget styles applied successfully');
      }
    };

    // Add message listener
    window.addEventListener("message", handleMessage);

    // Set up widget load detection
    const widget = document.getElementById('MiniChartWidget-84mnii1') as HTMLIFrameElement;
    
    if (widget) {
      // Handle successful load
      widget.onload = () => {
        console.log('Widget iframe loaded');
        setIsLoading(false);
      };

      // Handle load errors
      widget.onerror = () => {
        console.log('Widget failed to load');
        setWidgetError(true);
        setIsLoading(false);
      };

      // Timeout for widget loading
      const loadTimeout = setTimeout(() => {
        // Check if widget is actually responsive
        try {
          const iframeDoc = widget.contentDocument || widget.contentWindow?.document;
          if (!iframeDoc || iframeDoc.body.children.length === 0) {
            console.log('Widget appears empty after timeout');
            setWidgetError(true);
          }
        } catch (error) {
          console.log('Widget cross-origin access blocked - this is normal');
          // Don't set error for cross-origin issues, widget might still work
        }
        setIsLoading(false);
      }, 15000);

      return () => {
        window.removeEventListener("message", handleMessage);
        clearTimeout(loadTimeout);
      };
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setWidgetError(false);
    setIsLoading(true);
    
    // Force refresh the iframe
    const widget = document.getElementById('MiniChartWidget-84mnii1') as HTMLIFrameElement;
    if (widget) {
      const currentSrc = widget.src;
      widget.src = '';
      setTimeout(() => {
        widget.src = currentSrc;
        setTimeout(() => setIsRefreshing(false), 2000);
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
              The market widget cannot load on this page. Please navigate to the main dashboard to view the chart.
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
      
      <div className="relative flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-sm text-slate-400">Loading widget...</span>
            </div>
          </div>
        )}
        
        <iframe
          style={{
            border: 'none',
            width: '375px',
            height: '202px',
            borderRadius: '12px'
          }}
          data-widget-name="MiniChartWidget"
          src="https://widget.darqube.com/mini-chart-widget?token=684dde638d5a5327704d4084"
          id="MiniChartWidget-84mnii1"
          title="Profit.com Market Widget"
          allow="same-origin"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
};

export default ProfitWidget;
