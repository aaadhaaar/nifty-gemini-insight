
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useApiManagement = (userActive: boolean, getStrategicInterval: () => number) => {
  const [lastApiCall, setLastApiCall] = useState<Date | null>(null);
  const [apiCallsToday, setApiCallsToday] = useState(0);
  const [forceNextCall, setForceNextCall] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

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
    
    // Mark initialization as complete
    setInitialFetchDone(true);
  }, []);

  // Enhanced aggressive API call strategy
  const shouldMakeApiCall = () => {
    if (apiCallsToday >= 60) return false;
    if (!lastApiCall || forceNextCall) return true; // First call or forced call
    
    const now = new Date();
    const hour = now.getHours();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    const strategicInterval = getStrategicInterval();
    
    // Force calls during critical market periods regardless of interval
    const isCriticalPeriod = (
      (hour >= 9 && hour < 10) || // Market open
      (hour >= 15.5 && hour < 16) // Market close
    );
    
    if (isCriticalPeriod && timeSinceLastCall >= 10 * 60 * 1000 && userActive) {
      return true; // Force call every 10 minutes during critical periods
    }
    
    return timeSinceLastCall >= strategicInterval;
  };

  // Enhanced market data fetching with aggressive retry logic
  const fetchMarketData = async (forceCall = false) => {
    if (!shouldMakeApiCall() && !forceCall) {
      console.log('Skipping API call - strategic timing optimization');
      return;
    }

    if (apiCallsToday >= 60 && !forceCall) {
      console.log('Daily API limit reached (60 calls) - strategic conservation mode');
      return;
    }

    try {
      const now = new Date();
      const hour = now.getHours();
      
      // Aggressive search strategy when forcing calls
      let searchIntensity = forceCall ? 'high' : 'standard';
      if ((hour >= 9 && hour < 10) || (hour >= 15.5 && hour < 16)) {
        searchIntensity = 'high'; // Market open/close
      } else if (hour >= 7 && hour < 9) {
        searchIntensity = 'pre-market'; // Pre-market focus
      } else if (hour >= 16 && hour < 18) {
        searchIntensity = 'post-market'; // Post-market analysis
      }
      
      console.log(`${forceCall ? 'FORCED' : 'Strategic'} market fetch - ${searchIntensity} intensity (${apiCallsToday + 1}/60 calls)`);
      
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { 
          searchIntensity, 
          timeContext: hour,
          forceRefresh: forceCall
        }
      });
      
      if (error) {
        console.error('Error fetching strategic market data:', error);
        // If forced call fails, try again in 30 seconds
        if (forceCall) {
          setTimeout(() => setForceNextCall(true), 30000);
        }
      } else {
        console.log('Strategic market data result:', data);
        
        const newCallCount = apiCallsToday + 1;
        
        setLastApiCall(now);
        setApiCallsToday(newCallCount);
        setForceNextCall(false);
        
        // Store in localStorage
        localStorage.setItem('lastApiCall', now.toISOString());
        localStorage.setItem('apiCallsToday', newCallCount.toString());
        localStorage.setItem('lastApiCallDate', now.toDateString());
      }
    } catch (error) {
      console.error('Error in strategic fetch-news function:', error);
      // Retry on error if this was a forced call
      if (forceCall) {
        setTimeout(() => setForceNextCall(true), 30000);
      }
    }
  };

  // Force next API call (used when no events detected)
  const forceApiCall = () => {
    console.log('Forcing immediate API call');
    setForceNextCall(true);
    fetchMarketData(true);
  };

  // Enhanced auto-fetch system with immediate initial fetch
  useEffect(() => {
    // Only proceed if initialization is complete
    if (!initialFetchDone) return;

    const triggerInitialFetch = () => {
      console.log('Checking for initial fetch trigger...');
      console.log('Last API call:', lastApiCall);
      console.log('API calls today:', apiCallsToday);
      console.log('User active:', userActive);
      
      // Force initial fetch if no calls made today or no recent calls
      const shouldForceInitialFetch = (
        apiCallsToday === 0 || 
        !lastApiCall || 
        (new Date().getTime() - (lastApiCall?.getTime() || 0)) > 30 * 60 * 1000 // 30 minutes
      );
      
      if (shouldForceInitialFetch) {
        console.log('Triggering initial strategic fetch');
        fetchMarketData(true); // Force initial fetch
      }
    };

    // Trigger initial fetch after a short delay to ensure everything is loaded
    const initialTimer = setTimeout(triggerInitialFetch, 1000);

    // Market-aware interval checking
    const strategicInterval = setInterval(() => {
      if ((shouldMakeApiCall() || forceNextCall) && (userActive || new Date().getHours() >= 9 && new Date().getHours() <= 16)) {
        fetchMarketData(forceNextCall);
      }
    }, 30 * 60 * 1000); // Check every 30 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(strategicInterval);
    };
  }, [apiCallsToday, lastApiCall, userActive, forceNextCall, initialFetchDone]);

  return {
    lastApiCall,
    apiCallsToday,
    fetchMarketData,
    forceApiCall
  };
};
