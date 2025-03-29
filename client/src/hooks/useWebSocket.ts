import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

type WebSocketMessageType = 
  | 'INIT_STATE'
  | 'AGENTS_UPDATE'
  | 'STATS_UPDATE'
  | 'ACTIVITIES_UPDATE'
  | 'PONG';

interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: any;
  timestamp?: number;
}

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const { toast } = useToast();
  
  // Set up WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      // Close existing socket if any
      if (socket) {
        socket.close();
      }
      
      // Determine WebSocket URL based on current location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send initial ping to get state
        newSocket.send(JSON.stringify({ type: 'PING' }));
        
        // Send a request for initial data
        newSocket.send(JSON.stringify({ type: 'GET_AGENTS' }));
        newSocket.send(JSON.stringify({ type: 'GET_STATS' }));
        newSocket.send(JSON.stringify({ type: 'GET_ACTIVITIES', count: 20 }));
      };
      
      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      newSocket.onclose = () => {
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        const reconnectDelay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, reconnectDelay);
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        
        // Show toast on first error only
        if (reconnectAttempts.current === 0) {
          toast({
            title: "Connection Error",
            description: "Lost connection to the server. Attempting to reconnect...",
            variant: "destructive",
          });
        }
      };
      
      setSocket(newSocket);
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [toast]);
  
  // Send a message through the WebSocket
  const sendMessage = useCallback((type: string, data?: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }, [socket, isConnected]);
  
  // Request a data refresh
  const refreshData = useCallback(() => {
    sendMessage('GET_AGENTS');
    sendMessage('GET_STATS');
    sendMessage('GET_ACTIVITIES', { count: 20 });
  }, [sendMessage]);
  
  // Set up connection on component mount and clean up on unmount
  useEffect(() => {
    connectWebSocket();
    
    // Set up regular ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket && isConnected) {
        sendMessage('PING');
      }
    }, 30000); // Send ping every 30 seconds
    
    return () => {
      if (socket) {
        socket.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      clearInterval(pingInterval);
    };
  }, [connectWebSocket, sendMessage, socket, isConnected]);
  
  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    refreshData
  };
};
