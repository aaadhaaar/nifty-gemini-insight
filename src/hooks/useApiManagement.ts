
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useApiManagement = (userActive: boolean, getStrategicInterval: () => number) => {
  const [lastApiCall, setLastApiCall] = useState<Date | null>(null);
  const [apiCallsToday, setApiCallsToday] = useState(0);

  // Load stored data on mount
  useEffect(() => {
    const storedLastCall = localStorage.getItem('lastApiCall');
    const storedCallsToday = localStorage.getItem('apiCallsToday');
    const storedDate = localStorage.getItem('lastApiCallDate');
    
    const today = new Date().toDateString();
    
    if (storedLastCall && storedDate === today) {
      setLastApiCall(new Date(storedLastCall));
      setApiCallsToday(parseInt(storedCallsToday || '0', 10));
    } else {
      // Reset daily counter if it's a new day
      localStorage.setItem('apiCallsToday', '0');
      localStorage.setItem('lastApiCallDate', today);
      setApiCallsToday(0);
    }
  }, []);

  // Smart API call strategy with priority system
  const shouldMakeApiCall = () => {
    if (apiCallsToday >= 60) return false;
    if (!lastApiCall) return true; // First call of the session
    
    const now = new Date();
    const hour = now.getHours();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    const strategicInterval = getStrategicInterval();
    
    // Force calls during critical market periods regardless of interval
    const isCriticalPeriod = (
      (hour >= 9 && hour < 10) || // Market open
      (hour >= 15.5 && hour < 16) // Market close
    );
    
    if (isCriticalPeriod && timeSinceLastCall >= 15 * 60 * 1000 && userActive) {
      return true; // Force call every 15 minutes during critical periods
    }
    
    return timeSinceLastCall >= strategicInterval;
  };

  // Enhanced market data fetching with priority queuing
  const fetchMarketData = async () => {
    if (!shouldMakeApiCall()) {
      console.log('Skipping API call - strategic timing optimization');
      return;
    }

    if (apiCallsToday >= 60) {
      console.log('Daily API limit reached (60 calls) - strategic conservation mode');
      return;
    }

    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Priority-based search strategy
      let searchIntensity = 'standard';
      if ((hour >= 9 && hour < 10) || (hour >= 15.5 && hour < 16)) {
        searchIntensity = 'high'; // Market open/close
      } else if (hour >= 7 && hour < 9) {
        searchIntensity = 'pre-market'; // Pre-market focus
      } else if (hour >= 16 && hour < 18) {
        searchIntensity = 'post-market'; // Post-market analysis
      }
      
      console.log(`Strategic market fetch - ${searchIntensity} intensity (${apiCallsToday + 1}/60 calls)`);
      
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { searchIntensity, timeContext: hour }
      });
      
      if (error) {
        console.error('Error fetching strategic market data:', error);
      } else {
        console.log('Strategic market data result:', data);
        
        const newCallCount = apiCallsToday + 1;
        
        setLastApiCall(now);
        setApiCallsToday(newCallCount);
        
        // Store in localStorage
        localStorage.setItem('lastApiCall', now.toISOString());
        localStorage.setItem('apiCallsToday', newCallCount.toString());
        localStorage.setItem('lastApiCallDate', now.toDateString());
      }
    } catch (error) {
      console.error('Error in strategic fetch-news function:', error);
    }
  };

  // Intelligent auto-fetch system with market-aware scheduling
  useEffect(() => {
    // Strategic initial fetch based on market timing
    const checkStrategicFetch = () => {
      const storedDate = localStorage.getItem('lastApiCallDate');
      const today = new Date().toDateString();
      const hour = new Date().getHours();
      
      // Prioritize initial fetch during market hours
      const isMarketHours = hour >= 9 && hour <= 16;
      const shouldInitialFetch = (
        storedDate !== today && 
        apiCallsToday === 0 && 
        (isMarketHours || userActive)
      );
      
      if (shouldInitialFetch) {
        console.log('Strategic initial fetch triggered');
        fetchMarketData();
      }
    };

    checkStrategicFetch();

    // Market-aware interval checking
    const strategicInterval = setInterval(() => {
      if (shouldMakeApiCall() && (userActive || new Date().getHours() >= 9 && new Date().getHours() <= 16)) {
        fetchMarketData();
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => clearInterval(strategicInterval);
  }, [apiCallsToday, lastApiCall, userActive]);

  return {
    lastApiCall,
    apiCallsToday,
    fetchMarketData
  };
};
