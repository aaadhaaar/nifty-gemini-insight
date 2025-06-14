
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSmartRefresh = () => {
  const [lastApiCall, setLastApiCall] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiCallsToday, setApiCallsToday] = useState(0);
  const [userActive, setUserActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());

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
      localStorage.setItem('apiCallsToday', '0');
      localStorage.setItem('lastApiCallDate', today);
      setApiCallsToday(0);
    }
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setUserActive(true);
      setLastActivity(new Date());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    const inactivityTimer = setInterval(() => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (timeSinceActivity > fiveMinutes) {
        setUserActive(false);
      }
    }, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityTimer);
    };
  }, [lastActivity]);

  const getSmartInterval = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour <= 16) {
      return userActive ? 45 * 60 * 1000 : 90 * 60 * 1000;
    } else if (hour >= 17 && hour <= 22) {
      return userActive ? 90 * 60 * 1000 : 3 * 60 * 60 * 1000;
    } else {
      return 6 * 60 * 60 * 1000;
    }
  };

  const shouldMakeApiCall = () => {
    if (apiCallsToday >= 60) return false;
    if (!lastApiCall) return true;
    
    const now = new Date();
    const timeSinceLastCall = now.getTime() - lastApiCall.getTime();
    const smartInterval = getSmartInterval();
    
    return timeSinceLastCall >= smartInterval;
  };

  const fetchMarketData = async (isManual = false) => {
    if (!isManual && !shouldMakeApiCall()) {
      console.log('Skipping API call - not needed yet or daily limit reached');
      return;
    }

    if (apiCallsToday >= 60) {
      console.log('Daily API limit reached');
      return;
    }

    try {
      console.log('Triggering market events fetch...');
      setIsRefreshing(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-news');
      if (error) {
        console.error('Error fetching market data:', error);
      } else {
        console.log('Market data fetch result:', data);
        
        const now = new Date();
        const newCallCount = apiCallsToday + 1;
        
        setLastApiCall(now);
        setApiCallsToday(newCallCount);
        
        localStorage.setItem('lastApiCall', now.toISOString());
        localStorage.setItem('apiCallsToday', newCallCount.toString());
        localStorage.setItem('lastApiCallDate', now.toDateString());
      }
    } catch (error) {
      console.error('Error calling fetch-news function:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    if (apiCallsToday >= 60) {
      console.log('Cannot refresh: Daily limit reached');
      return;
    }
    fetchMarketData(true);
  };

  // Smart auto-fetch system
  useEffect(() => {
    const checkInitialFetch = () => {
      const storedDate = localStorage.getItem('lastApiCallDate');
      const today = new Date().toDateString();
      
      if (storedDate !== today && apiCallsToday === 0) {
        fetchMarketData();
      }
    };

    checkInitialFetch();

    const smartInterval = setInterval(() => {
      if (shouldMakeApiCall()) {
        fetchMarketData();
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(smartInterval);
  }, [apiCallsToday, lastApiCall, userActive]);

  return {
    lastApiCall,
    isRefreshing,
    apiCallsToday,
    userActive,
    handleManualRefresh
  };
};
