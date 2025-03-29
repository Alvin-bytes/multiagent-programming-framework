import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSystemStats, useThreadStats } from '@/hooks/useSystemStats';
import { useSystemActivities } from '@/hooks/useAgents';
import { SystemStats, SystemActivity } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SystemContextType {
  stats: SystemStats | undefined;
  threadStats: {
    activeThreads: number;
    maxThreads: number;
    availableThreads: number;
  };
  activities: SystemActivity[];
  isLoading: boolean;
  isInitialized: boolean;
  error: unknown;
  refreshStats: () => void;
  refreshActivities: (count?: number) => void;
  refreshThreadStats: () => void;
  refreshAll: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stats, isLoading: statsLoading, error: statsError, refreshStats } = useSystemStats();
  const { threadStats, isLoading: threadStatsLoading, error: threadStatsError, refreshThreadStats } = useThreadStats();
  const { activities, isLoading: activitiesLoading, error: activitiesError, refreshActivities } = useSystemActivities();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Determine if system is initialized
  useEffect(() => {
    if (stats && activities && !statsLoading && !activitiesLoading) {
      setIsInitialized(true);
    }
  }, [stats, activities, statsLoading, activitiesLoading]);
  
  // Show error toast if any data fails to load
  useEffect(() => {
    if (statsError || threadStatsError || activitiesError) {
      toast({
        title: 'Error',
        description: 'Failed to load system data. Some features may not work correctly.',
        variant: 'destructive',
      });
    }
  }, [statsError, threadStatsError, activitiesError, toast]);
  
  // Refresh all data
  const refreshAll = () => {
    refreshStats();
    refreshThreadStats();
    refreshActivities(20);
  };
  
  // Set up periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const isLoading = statsLoading || threadStatsLoading || activitiesLoading;
  const error = statsError || threadStatsError || activitiesError;
  
  const contextValue: SystemContextType = {
    stats,
    threadStats,
    activities: activities || [],
    isLoading,
    isInitialized,
    error,
    refreshStats,
    refreshActivities,
    refreshThreadStats,
    refreshAll,
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystemContext = (): SystemContextType => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemContext must be used within a SystemProvider');
  }
  return context;
};
