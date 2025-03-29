import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAgents } from '@/hooks/useAgents';
import { Agent, AgentType, AgentStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AgentContextType {
  agents: Agent[];
  isLoading: boolean;
  error: unknown;
  designAgent: Agent | undefined;
  codingAgent: Agent | undefined;
  supervisionAgent: Agent | undefined;
  debugAgent: Agent | undefined;
  refreshAgents: () => void;
  updateAgentStatus: (id: number, status: AgentStatus) => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { agents, isLoading, error, refreshAgents } = useAgents();
  const { toast } = useToast();
  
  // Extract specific agents for easier access
  const designAgent = agents.find(agent => agent.type === AgentType.DESIGN);
  const codingAgent = agents.find(agent => agent.type === AgentType.CODING);
  const supervisionAgent = agents.find(agent => agent.type === AgentType.SUPERVISION);
  const debugAgent = agents.find(agent => agent.type === AgentType.DEBUG);
  
  // Function to update agent status
  const updateAgentStatus = async (id: number, status: AgentStatus) => {
    try {
      const response = await fetch(`/api/agents/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update agent status: ${response.statusText}`);
      }
      
      // Refresh agents after status update
      refreshAgents();
      
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update agent status',
        variant: 'destructive',
      });
    }
  };
  
  const contextValue: AgentContextType = {
    agents,
    isLoading,
    error,
    designAgent,
    codingAgent,
    supervisionAgent,
    debugAgent,
    refreshAgents,
    updateAgentStatus,
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
};
