
import { useState, useEffect } from 'react';

export const useStrategicTiming = () => {
  const [userActive, setUserActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());

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

    // Check for inactivity every minute
    const inactivityTimer = setInterval(() => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - lastActivity.getTime();
      const tenMinutes = 10 * 60 * 1000;
      
      if (timeSinceActivity > tenMinutes) {
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

  // Strategic API call timing for maximum market impact coverage
  const getStrategicInterval = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Pre-market (7-9 AM) - High priority for overnight developments
    if (hour >= 7 && hour < 9) {
      return userActive ? 45 * 60 * 1000 : 90 * 60 * 1000; // 45min active, 90min inactive
    }
    // Market open (9-10 AM) - Critical opening hour
    else if (hour >= 9 && hour < 10) {
      return userActive ? 20 * 60 * 1000 : 40 * 60 * 1000; // 20min active, 40min inactive
    }
    // Morning session (10 AM-12 PM) - Active trading
    else if (hour >= 10 && hour < 12) {
      return userActive ? 30 * 60 * 1000 : 60 * 60 * 1000; // 30min active, 60min inactive
    }
    // Lunch break (12-1 PM) - Reduced frequency
    else if (hour >= 12 && hour < 13) {
      return userActive ? 60 * 60 * 1000 : 120 * 60 * 1000; // 60min active, 120min inactive
    }
    // Afternoon session (1-3:30 PM) - Active trading
    else if (hour >= 13 && hour < 15.5) {
      return userActive ? 25 * 60 * 1000 : 50 * 60 * 1000; // 25min active, 50min inactive
    }
    // Market close (3:30-4 PM) - Critical closing analysis
    else if (hour >= 15.5 && hour < 16) {
      return userActive ? 15 * 60 * 1000 : 30 * 60 * 1000; // 15min active, 30min inactive
    }
    // Post-market (4-6 PM) - Moderate for results/announcements
    else if (hour >= 16 && hour < 18) {
      return userActive ? 60 * 60 * 1000 : 120 * 60 * 1000; // 60min active, 120min inactive
    }
    // Evening (6-10 PM) - Global market watch
    else if (hour >= 18 && hour < 22) {
      return userActive ? 90 * 60 * 1000 : 180 * 60 * 1000; // 90min active, 180min inactive
    }
    // Night (10 PM-7 AM) - Very infrequent, overnight developments only
    else {
      return 240 * 60 * 1000; // 4 hours regardless of activity
    }
  };

  return {
    userActive,
    getStrategicInterval
  };
};
