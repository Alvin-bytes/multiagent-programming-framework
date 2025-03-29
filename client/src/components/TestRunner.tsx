import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboardTests } from '@/tests/DashboardTests';
import { agentOnboardingTests } from '@/tests/AgentOnboardingTests';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  elementName: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface TestSummary {
  totalTests: number;
  passedTests: number;
  warningTests: number;
  failedTests: number;
  detailedResults: TestResult[];
}

const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [results, setResults] = useState<TestSummary | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      let testResults;
      
      if (activeTab === 'dashboard') {
        testResults = await dashboardTests.runAllTests();
      } else if (activeTab === 'onboarding') {
        testResults = await agentOnboardingTests.runAllTests();
      } else if (activeTab === 'comprehensive') {
        // For comprehensive tests, run both test suites
        const dashboardResult = await dashboardTests.runAllTests();
        
        // Navigate to onboarding page
        window.location.href = '/onboarding';
        
        // Give time for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const onboardingResult = await agentOnboardingTests.runAllTests();
        
        // Combine results
        testResults = {
          totalTests: dashboardResult.totalTests + onboardingResult.totalTests,
          passedTests: dashboardResult.passedTests + onboardingResult.passedTests,
          warningTests: dashboardResult.warningTests + onboardingResult.warningTests,
          failedTests: dashboardResult.failedTests + onboardingResult.failedTests,
          detailedResults: [...dashboardResult.detailedResults, ...onboardingResult.detailedResults]
        };
        
        // Navigate back to dashboard
        window.location.href = '/';
      }
      
      if (testResults) {
        setResults(testResults);
        
        toast({
          title: 'Test Run Completed',
          description: `${testResults.passedTests} passed, ${testResults.warningTests} warnings, ${testResults.failedTests} failed`,
          variant: testResults.failedTests > 0 ? 'destructive' : 'default'
        });
      } else {
        toast({
          title: 'Test Run Failed',
          description: 'Failed to get test results',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: 'Test Run Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const renderResultItem = (result: TestResult) => {
    const statusColor = 
      result.status === 'success' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900' : 
      result.status === 'warning' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900' : 
      'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900';
      
    return (
      <div key={`${result.elementName}-${result.timestamp.getTime()}`} className="mb-2 p-2 rounded border">
        <div className="flex justify-between">
          <span className="font-medium">{result.elementName}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
            {result.status.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {result.timestamp.toLocaleTimeString()}
        </p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UI Functional Test Runner</CardTitle>
        <CardDescription>
          Run comprehensive tests on the UI to ensure all components are working properly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard Tests</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding Tests</TabsTrigger>
            <TabsTrigger value="comprehensive">Comprehensive Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <p className="mb-4">
              Tests the main dashboard UI components, including navigation tabs, sidebar, user interaction panel, 
              system activity panel, and visualization components.
            </p>
          </TabsContent>
          
          <TabsContent value="onboarding">
            <p className="mb-4">
              Tests the agent onboarding flow, including step navigation, form elements, API key configuration, 
              and agent configuration options.
            </p>
          </TabsContent>
          
          <TabsContent value="comprehensive">
            <p className="mb-4">
              Runs a complete suite of tests across all pages and components, including API endpoints, 
              WebSocket connections, and UI functionality.
            </p>
          </TabsContent>
        </Tabs>
        
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
        
        {results && (
          <div className="mt-4">
            <div className="flex gap-4 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900 rounded flex flex-col items-center">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{results.passedTests}</span>
                <span className="text-xs text-muted-foreground">Passed</span>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900 rounded flex flex-col items-center">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{results.warningTests}</span>
                <span className="text-xs text-muted-foreground">Warnings</span>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900 rounded flex flex-col items-center">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{results.failedTests}</span>
                <span className="text-xs text-muted-foreground">Failed</span>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded flex flex-col items-center">
                <span className="text-lg font-bold">{results.totalTests}</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Detailed Results</h3>
            <ScrollArea className="h-[300px] border rounded p-2">
              {results.detailedResults
                .sort((a, b) => {
                  // Sort by status: error first, then warning, then success
                  const statusOrder = { error: 0, warning: 1, success: 2 };
                  return statusOrder[a.status] - statusOrder[b.status];
                })
                .map(renderResultItem)}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestRunner;