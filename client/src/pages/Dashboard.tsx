import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import AgentStatus from "@/components/AgentStatus";
import SystemStats from "@/components/SystemStats";
import QuickActions from "@/components/QuickActions";
import UserInteraction from "@/components/UserInteraction";
import SystemActivity from "@/components/SystemActivity";
import NotificationToast from "@/components/NotificationToast";
import { useSystemContext } from "@/contexts/SystemContext";
import { useMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "Operation successful",
    message: "Task analysis completed and agents are now processing your request.",
    variant: "success" as const
  });
  const { isInitialized } = useSystemContext();
  const isMobile = useMobile();
  const splitPanelsRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startLeftWidthRef = useRef<number>(0);
  const separatorRef = useRef<HTMLDivElement | null>(null);

  // Setup resizable panels for desktop
  useEffect(() => {
    if (isMobile || !splitPanelsRef.current) return;
    
    const container = splitPanelsRef.current;
    const leftPanel = leftPanelRef.current;
    
    if (!leftPanel) return;
    
    // Create separator if it doesn't exist
    if (!separatorRef.current) {
      const separator = document.createElement('div');
      separator.className = 'gutter gutter-horizontal w-2 cursor-col-resize bg-gray-200 dark:bg-gray-700';
      separatorRef.current = separator;
      leftPanel.after(separator);
    }
    
    const handleMouseDown = (e: MouseEvent) => {
      resizingRef.current = true;
      startXRef.current = e.clientX;
      startLeftWidthRef.current = leftPanel.getBoundingClientRect().width;
      
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      
      const containerWidth = container.clientWidth;
      const minWidth = containerWidth * 0.2; // 20% minimum
      const maxWidth = containerWidth * 0.8; // 80% maximum
      
      let newLeftWidth = Math.max(
        minWidth,
        Math.min(startLeftWidthRef.current + (e.clientX - startXRef.current), maxWidth)
      );
      
      leftPanel.style.width = `${newLeftWidth}px`;
      leftPanel.style.flexGrow = '0';
      leftPanel.style.flexShrink = '0';
      leftPanel.style.flexBasis = 'auto';
    };
    
    const handleMouseUp = () => {
      resizingRef.current = false;
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    
    separatorRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      separatorRef.current?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMobile]);
  
  // Show welcome notification on first load
  useEffect(() => {
    if (isInitialized) {
      // Wait a bit before showing the notification
      const timer = setTimeout(() => {
        setNotificationData({
          title: "System Initialized",
          message: "The MultiAgent LLM Framework is ready. You can start a new task.",
          variant: "success"
        });
        setShowNotification(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="h-full flex flex-col">
            <AgentStatus />
            <SystemStats />
            <QuickActions />
          </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 flex space-x-4">
              <button className="px-4 py-3 border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium">
                Main Interface
              </button>
              <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Documentation
              </button>
              <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Agent Configuration
              </button>
              <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Project Files
              </button>
            </div>
          </div>
          
          {/* Split Panels */}
          <div 
            className="flex-1 flex flex-col lg:flex-row overflow-hidden" 
            id="split-panels"
            ref={splitPanelsRef}
          >
            {/* Left Panel - User Interaction */}
            <div 
              className="flex-1 flex flex-col overflow-hidden" 
              id="user-interaction-panel"
              ref={leftPanelRef}
            >
              <UserInteraction />
            </div>
            
            {/* Right Panel - System Activity */}
            <div 
              className="h-96 lg:h-auto lg:flex-1 flex flex-col overflow-hidden" 
              id="system-activity-panel"
            >
              <SystemActivity />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Toast */}
      {showNotification && (
        <NotificationToast
          title={notificationData.title}
          message={notificationData.message}
          variant={notificationData.variant}
          duration={5000}
          id="notification-toast"
        />
      )}
    </div>
  );
}
