import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";
import { Agent } from "@/types";

export const useAgents = () => {
  const { lastMessage, sendMessage } = useWebSocket();
  
  // Fetch agents from API
  const {
    data: agents,
    error,
    isLoading,
    refetch
  } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
    staleTime: 60000, // 1 minute
  });
  
  // Update agents when we receive a websocket message
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'AGENTS_UPDATE') {
      refetch();
    }
  }, [lastMessage, refetch]);
  
  // Request refreshed agent data
  const refreshAgents = () => {
    sendMessage('GET_AGENTS');
    refetch();
  };
  
  return {
    agents: agents || [],
    error,
    isLoading,
    refreshAgents
  };
};

// Hook for system activities
export const useSystemActivities = () => {
  const { lastMessage, sendMessage } = useWebSocket();
  
  // Fetch activities from API
  const {
    data: activities,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/activities'],
    staleTime: 10000, // 10 seconds - activities change frequently
  });
  
  // Update activities when we receive a websocket message
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ACTIVITIES_UPDATE') {
      refetch();
    }
  }, [lastMessage, refetch]);
  
  // Request refreshed activity data
  const refreshActivities = (count = 20) => {
    sendMessage('GET_ACTIVITIES', { count });
    refetch();
  };
  
  return {
    activities: activities || [],
    error,
    isLoading,
    refreshActivities
  };
};
