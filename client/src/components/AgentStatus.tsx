import { useMemo } from "react";
import { useAgents } from "@/hooks/useAgents";
import { AgentStatus as AgentStatusType } from "@/types";

export default function AgentStatus() {
  const { agents, isLoading, error } = useAgents();

  // Generate status badge color based on agent status
  const getStatusBadgeClasses = (status: AgentStatusType) => {
    switch (status) {
      case 'active':
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400";
      case 'idle':
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400";
      case 'observing':
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400";
      case 'standby':
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400";
      case 'error':
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-900 text-gray-700 dark:text-gray-400";
    }
  };

  // Get color for status indicator
  const getStatusIndicatorColor = (status: AgentStatusType) => {
    switch (status) {
      case 'active': return "bg-green-500";
      case 'idle': return "bg-yellow-500";
      case 'observing': return "bg-blue-500";
      case 'standby': return "bg-purple-500";
      case 'error': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Capitalize first letter of status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Agent Status</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Agent Status</h2>
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
          Error loading agents
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Agent Status</h2>
      <ul className="space-y-2">
        {agents.map((agent) => (
          <li
            key={agent.id}
            className={`flex items-center justify-between p-2 rounded-md border ${getStatusBadgeClasses(agent.status as AgentStatusType)}`}
          >
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 ${getStatusIndicatorColor(agent.status as AgentStatusType)} rounded-full`}></div>
              <span className="font-medium">{agent.name}</span>
            </div>
            <span className="text-xs">{formatStatus(agent.status)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
