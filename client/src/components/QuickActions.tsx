import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function QuickActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  const handleStartNewTask = async () => {
    setIsLoading(true);
    
    try {
      // Create new project for the task
      const projectResponse = await apiRequest("POST", "/api/projects", {
        name: `Project ${new Date().toISOString()}`,
        description: "New task created via quick actions",
        userId: 1
      });
      
      const projectData = await projectResponse.json();
      
      toast({
        title: "New Task Started",
        description: "A new task has been created successfully.",
      });
      
      // Refresh projects data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Navigate to user interaction panel (the current page, but focuses the input)
      const messageInput = document.querySelector('textarea[placeholder="Type your message here..."]') as HTMLTextAreaElement;
      if (messageInput) {
        messageInput.focus();
        messageInput.value = "I'd like to start a new task: ";
      }
    } catch (error) {
      console.error("Error starting new task:", error);
      toast({
        title: "Error",
        description: "Failed to start a new task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLogs = () => {
    // Open the logs tab in the system activity panel
    const logsTab = document.querySelector('button:contains("Agent Logs")') as HTMLButtonElement;
    if (logsTab) {
      logsTab.click();
    }
    
    // If we're on mobile, scroll to the system activity panel
    if (window.innerWidth < 1024) {
      const systemPanel = document.getElementById('system-activity-panel');
      if (systemPanel) {
        systemPanel.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOpenSettings = () => {
    // Trigger the settings modal through the header button
    const settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
    if (settingsButton) {
      settingsButton.click();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
      <div className="space-y-2">
        <Button 
          variant="default" 
          className="w-full flex items-center justify-center"
          onClick={handleStartNewTask}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start New Task
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={handleViewLogs}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Logs
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={handleOpenSettings}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Settings
        </Button>
      </div>
    </div>
  );
}
