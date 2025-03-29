import { useSystemStats } from "@/hooks/useSystemStats";

export default function SystemStats() {
  const { stats, isLoading, error } = useSystemStats();

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate percentages
  const calculatePercentage = (value: number, total: number) => {
    return (value / total) * 100;
  };

  if (isLoading) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3">System Stats</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-3">System Stats</h2>
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
          Error loading system stats
        </div>
      </div>
    );
  }

  const apiTokenPercentage = calculatePercentage(stats.apiTokensUsed, stats.apiTokensLimit);
  const memoryPercentage = calculatePercentage(stats.memoryUsed, stats.memoryLimit);
  const threadsPercentage = calculatePercentage(stats.activeThreads, stats.threadLimit);

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-3">System Stats</h2>
      
      {/* API Usage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">API Tokens Used</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatNumber(stats.apiTokensUsed)} / {formatNumber(stats.apiTokensLimit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full" 
            style={{ width: `${apiTokenPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Memory Usage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Memory Usage</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {stats.memoryUsed}MB / {stats.memoryLimit}MB
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-amber-500 h-2 rounded-full" 
            style={{ width: `${memoryPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Active Threads */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Active Threads</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {stats.activeThreads} / {stats.threadLimit}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-emerald-500 h-2 rounded-full" 
            style={{ width: `${threadsPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
