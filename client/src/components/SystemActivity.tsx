import { useState, useEffect } from "react";
import { useSystemActivities } from "@/hooks/useSystemActivities";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineItemProps {
  type: string;
  timestamp: Date;
  title: string;
  description: string;
}

function TimelineItem({ type, timestamp, title, description }: TimelineItemProps) {
  // Generate the appropriate icon and colors based on activity type
  const getIconAndColors = () => {
    switch (type) {
      case 'supervision':
        return {
          bgColor: 'bg-blue-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'design':
        return {
          bgColor: 'bg-green-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          ),
          badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'coding':
        return {
          bgColor: 'bg-yellow-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          ),
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'debug':
        return {
          bgColor: 'bg-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      case 'api_call':
        return {
          bgColor: 'bg-indigo-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
        };
      case 'thread_allocation':
        return {
          bgColor: 'bg-purple-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          ),
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        };
      case 'system_error':
        return {
          bgColor: 'bg-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      default:
        return {
          bgColor: 'bg-gray-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
    }
  };

  const { bgColor, icon, badge } = getIconAndColors();

  return (
    <div>
      <div className={`absolute left-0 top-1 ${bgColor} rounded-full h-8 w-8 flex items-center justify-center`}>
        {icon}
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium">{title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium ${badge} rounded-full`}>
            {type.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
          </span>
        </div>
        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
}

function TerminalOutput() {
  const { activities } = useSystemActivities();
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (activities && activities.length > 0) {
      // Generate terminal output from activities
      const lines = activities.slice(0, 15).map(activity => {
        const timestamp = new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `[${timestamp}] ${activity.type.toUpperCase()}: ${activity.description}`;
      });
      setTerminalLines(lines);
    }
  }, [activities]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Terminal Output</h3>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
      </div>
      <div className="terminal h-32 overflow-y-auto text-xs">
        {terminalLines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        {terminalLines.length === 0 && (
          <div>No terminal output available</div>
        )}
      </div>
    </div>
  );
}

export default function SystemActivity() {
  const { activities, isLoading, error } = useSystemActivities();
  const [activeTab, setActiveTab] = useState("live");

  if (isLoading) {
    return (
      <div className="h-96 lg:h-auto lg:flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Activity</h2>
          <div className="space-x-2 flex">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex space-x-4 px-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 lg:h-auto lg:flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Activity</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md text-red-700 dark:text-red-400">
            Failed to load system activities. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 lg:h-auto lg:flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Activity</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Clear">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <nav className="flex space-x-4 px-4">
          <button
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === "live"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("live")}
          >
            Live Activity
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === "logs"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("logs")}
          >
            Agent Logs
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === "api"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("api")}
          >
            API Calls
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === "performance"
                ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent"
            }`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
        </nav>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          {/* Timeline items */}
          <div className="space-y-6 relative pl-10">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <TimelineItem
                  key={activity.id}
                  type={activity.type}
                  timestamp={new Date(activity.createdAt)}
                  title={activity.type === 'api_call' ? 'API Call' : 
                         activity.type === 'thread_allocation' ? 'Thread Allocation' :
                         activity.type === 'system_error' ? 'System Error' :
                         activity.type.charAt(0).toUpperCase() + activity.type.slice(1) + ' Agent'}
                  description={activity.description}
                />
              ))
            ) : (
              <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                No activity data available
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <TerminalOutput />
    </div>
  );
}
