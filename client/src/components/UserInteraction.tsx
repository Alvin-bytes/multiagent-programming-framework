import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Message, AgentType } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function UserInteraction() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useWebSocket();

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add system welcome message on first load
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          role: "system",
          content: "Welcome to the MultiAgent LLM Framework. I'm here to assist you with your programming tasks. This system uses specialized agents for design, coding, supervision, and debugging to create high-quality results efficiently.\n\nWhat project would you like to work on today?",
          timestamp: new Date(),
          sender: "System"
        }
      ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isSubmitting) return;
    
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      sender: "You"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsSubmitting(true);
    
    try {
      // First, let's have the supervision agent analyze the task
      const supervisionResponse = await apiRequest("POST", "/api/process", {
        message: inputMessage,
        agentType: AgentType.SUPERVISION
      });
      
      const supervisionData = await supervisionResponse.json();
      
      // Add supervision agent response
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: "agent",
          content: supervisionData.output,
          timestamp: new Date(),
          sender: "Supervision Agent"
        }
      ]);
      
      // Trigger a refetch of system stats and activities
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageClasses = (role: string) => {
    switch (role) {
      case "system":
        return "bg-purple-50 dark:bg-purple-900/20 text-gray-800 dark:text-gray-200";
      case "user":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      case "agent":
        return "bg-blue-50 dark:bg-blue-900/20 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getSenderColor = (role: string) => {
    switch (role) {
      case "system":
        return "text-purple-700 dark:text-purple-400";
      case "user":
        return "text-gray-900 dark:text-gray-200";
      case "agent":
        return "text-blue-700 dark:text-blue-400";
      default:
        return "text-gray-900 dark:text-gray-200";
    }
  };

  const formatTimestamp = (date: Date) => {
    return `${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Interaction</h2>
        <div>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="message-history">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
              message.role === "system" 
                ? "bg-purple-100 dark:bg-purple-900" 
                : message.role === "agent"
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-200 dark:bg-gray-700"
            } flex items-center justify-center`}>
              {message.role === "system" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : message.role === "agent" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className={`${getMessageClasses(message.role)} p-3 rounded-lg max-w-3xl`}>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-semibold ${getSenderColor(message.role)}`}>{message.sender}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(message.timestamp)}</span>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <textarea 
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" 
            placeholder="Type your message here..." 
            rows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button 
              type="button"
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Press Enter to send, Shift+Enter for new line</span>
          <button 
            type="submit"
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            disabled={isSubmitting || !inputMessage.trim()}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
            {isSubmitting ? "Processing..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
