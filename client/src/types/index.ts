// Agent types
export enum AgentType {
  DESIGN = 'design',
  CODING = 'coding',
  SUPERVISION = 'supervision',
  DEBUG = 'debug'
}

export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  OBSERVING = 'observing',
  STANDBY = 'standby',
  ERROR = 'error'
}

export interface Agent {
  id: number;
  name: string;
  type: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Task types
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Task {
  id: number;
  projectId: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export enum MessageType {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: Date;
  sender: string;
}

export interface ApiMessage {
  id: number;
  taskId: number | null;
  agentId: number | null;
  userId: number | null;
  content: string;
  type: string;
  createdAt: string;
}

// System types
export enum ActivityType {
  API_CALL = 'api_call',
  THREAD_ALLOCATION = 'thread_allocation',
  MEMORY_USAGE = 'memory_usage',
  AGENT_STATUS_CHANGE = 'agent_status_change',
  SYSTEM_ERROR = 'system_error'
}

export interface SystemActivity {
  id: number;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface SystemStats {
  id: number;
  apiTokensUsed: number;
  apiTokensLimit: number;
  memoryUsed: number;
  memoryLimit: number;
  activeThreads: number;
  threadLimit: number;
  updatedAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// LLM types
export interface LLMResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}
