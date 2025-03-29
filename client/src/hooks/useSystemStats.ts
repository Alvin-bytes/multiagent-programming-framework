import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";
import { SystemStats } from "@/types";

export const useSystemStats = () => {
  const { lastMessage, sendMessage } = useWebSocket();
  
  // Fetch system stats from API
  const {
    data: stats,
    error,
    isLoading,
    refetch
  } = useQuery<SystemStats>({
    queryKey: ['/api/stats'],
    staleTime: 30000, // 30 seconds
  });
  
  // Update stats when we receive a websocket message
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'STATS_UPDATE') {
      refetch();
    }
  }, [lastMessage, refetch]);
  
  // Request refreshed stats data
  const refreshStats = () => {
    sendMessage('GET_STATS');
    refetch();
  };
  
  return {
    stats,
    error,
    isLoading,
    refreshStats
  };
};

// Hook for thread stats
export const useThreadStats = () => {
  const {
    data: stats,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/thread-stats'],
    staleTime: 30000, // 30 seconds
  });
  
  return {
    threadStats: stats || { activeThreads: 0, maxThreads: 8, availableThreads: 8 },
    error,
    isLoading,
    refreshThreadStats: refetch
  };
};
