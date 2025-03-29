import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { dbStorage } from "./databaseStorage";
import { logger, loggerStream } from "./utils/logger";
import { z } from "zod";
import {
  insertMessageSchema,
  insertTaskSchema,
  ErrorType,
  insertProjectSchema,
  AgentType,
  AgentStatus,
  MessageType,
  TaskStatus,
  ActivityType
} from "@shared/schema";
import { threadManager } from "./utils/threadManager";
import { DesignAgent } from "./agents/designAgent";
import { CodingAgent } from "./agents/codingAgent";
import { SupervisionAgent } from "./agents/supervisionAgent";
import { DebugAgent } from "./agents/debugAgent";
import { SelfHealingAgent } from "./agents/selfHealingAgent";
import { agentTester } from "./tests/agentTester";
import { v4 as uuidv4 } from 'uuid';

// Initialize agent instances
let agents: {
  [AgentType.DESIGN]: DesignAgent;
  [AgentType.CODING]: CodingAgent;
  [AgentType.SUPERVISION]: SupervisionAgent;
  [AgentType.DEBUG]: DebugAgent;
  [AgentType.SELF_HEALING]: SelfHealingAgent;
} | null = null;

// Function to initialize agents
async function initializeAgents() {
  const allAgents = await storage.getAllAgents();
  
  // Find agent IDs by type
  const designAgentId = allAgents.find(a => a.type === AgentType.DESIGN)?.id || 1;
  const codingAgentId = allAgents.find(a => a.type === AgentType.CODING)?.id || 2;
  const supervisionAgentId = allAgents.find(a => a.type === AgentType.SUPERVISION)?.id || 3;
  const debugAgentId = allAgents.find(a => a.type === AgentType.DEBUG)?.id || 4;
  const selfHealingAgentId = allAgents.find(a => a.type === AgentType.SELF_HEALING)?.id || 5;
  
  // Create agent instances
  agents = {
    [AgentType.DESIGN]: new DesignAgent(designAgentId),
    [AgentType.CODING]: new CodingAgent(codingAgentId),
    [AgentType.SUPERVISION]: new SupervisionAgent(supervisionAgentId),
    [AgentType.DEBUG]: new DebugAgent(debugAgentId),
    [AgentType.SELF_HEALING]: new SelfHealingAgent(selfHealingAgentId)
  };
  
  logger.info('All agents initialized successfully');
}

// Websocket clients
interface WebSocketClient {
  id: string;
  socket: WebSocket;
}

// Store connected websocket clients
const webSocketClients: WebSocketClient[] = [];

// Broadcast message to all connected clients
function broadcastMessage(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  webSocketClients.forEach(client => {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
    // Comment out request logger middleware until it's properly implemented
  // Use Morgan or similar HTTP logger if needed
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize agents
  await initializeAgents();
  
  // WebSocket connection handler
  wss.on('connection', (socket: WebSocket) => {
    const clientId = uuidv4();
    
    logger.info(`New WebSocket connection: ${clientId}`);
    
    // Add client to the list
    webSocketClients.push({ id: clientId, socket });
    
    // Send initial system state
    Promise.all([
      storage.getAllAgents(),
      storage.getSystemStats(),
      storage.getRecentSystemActivities(10)
    ]).then(([agents, stats, activities]) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: 'INIT_STATE', 
          data: { agents, stats, activities } 
        }));
      }
    });
    
    // Handle messages from client
    socket.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        logger.debug(`Received WebSocket message: ${JSON.stringify(data)}`);
        
        // Process message based on type
        switch (data.type) {
          case 'PING':
            socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;
            
          case 'GET_AGENTS':
            const allAgents = await storage.getAllAgents();
            socket.send(JSON.stringify({ type: 'AGENTS_UPDATE', data: allAgents }));
            break;
            
          case 'GET_STATS':
            const stats = await storage.getSystemStats();
            socket.send(JSON.stringify({ type: 'STATS_UPDATE', data: stats }));
            break;
            
          case 'GET_ACTIVITIES':
            const count = data.count || 10;
            const activities = await storage.getRecentSystemActivities(count);
            socket.send(JSON.stringify({ type: 'ACTIVITIES_UPDATE', data: activities }));
            break;
            
          default:
            logger.warn(`Unknown WebSocket message type: ${data.type}`);
        }
      } catch (error) {
        logger.error(`Error processing WebSocket message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
    
    // Handle disconnection
    socket.on('close', () => {
      logger.info(`WebSocket connection closed: ${clientId}`);
      const index = webSocketClients.findIndex(client => client.id === clientId);
      if (index !== -1) {
        webSocketClients.splice(index, 1);
      }
    });
  });
  
  // REST API Routes
  
  // API health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Get all agents
  app.get('/api/agents', async (req: Request, res: Response) => {
    try {
      const allAgents = await storage.getAllAgents();
      res.json(allAgents);
    } catch (error) {
      logger.error(`Error getting agents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });
  
  // Get agent by ID
  app.get('/api/agents/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid agent ID' });
      }
      
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      logger.error(`Error getting agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });
  
  // Update agent status
  app.patch('/api/agents/:id/status', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid agent ID' });
      }
      
      const statusSchema = z.object({
        status: z.enum([
          AgentStatus.ACTIVE,
          AgentStatus.IDLE,
          AgentStatus.OBSERVING,
          AgentStatus.STANDBY,
          AgentStatus.ERROR
        ])
      });
      
      const validationResult = statusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      const { status } = validationResult.data;
      
      const updatedAgent = await storage.updateAgentStatus(id, status);
      if (!updatedAgent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      // Broadcast agent update
      broadcastMessage('AGENT_STATUS_UPDATE', updatedAgent);
      
      res.json(updatedAgent);
    } catch (error) {
      logger.error(`Error updating agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to update agent status' });
    }
  });
  
  // Get system stats
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      logger.error(`Error getting stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system stats' });
    }
  });
  
  // Get recent system activities
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || '10');
      const activities = await storage.getRecentSystemActivities(limit);
      res.json(activities);
    } catch (error) {
      logger.error(`Error getting activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system activities' });
    }
  });
  
  // Process a message with an agent
  app.post('/api/process', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        message: z.string().min(1),
        agentType: z.enum([
          AgentType.DESIGN, 
          AgentType.CODING, 
          AgentType.SUPERVISION, 
          AgentType.DEBUG,
          AgentType.SELF_HEALING
        ]),
        taskId: z.number().optional(),
        projectId: z.number().optional(),
        context: z.record(z.any()).optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid request data', details: validationResult.error });
      }
      
      const { message, agentType, taskId, projectId, context } = validationResult.data;
      
      // Create task if needed
      let task = taskId ? await storage.getTask(taskId) : null;
      if (!task && projectId) {
        task = await storage.createTask({
          projectId,
          description: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          status: TaskStatus.PENDING
        });
      }
      
      // Create message
      await storage.createMessage({
        taskId: task?.id,
        agentId: null,
        userId: 1, // Assuming default user
        content: message,
        type: MessageType.USER
      });
      
      // Get the agent
      if (!agents) {
        await initializeAgents();
      }
      
      // Process with agent
      const agent = agents![agentType];
      if (!agent) {
        return res.status(500).json({ error: `Agent of type ${agentType} not found` });
      }
      
      // Update task status
      if (task) {
        await storage.updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);
      }
      
      // Process the message
      const result = await agent.process(message, context);
      
      // If task exists, update its status based on result
      if (task) {
        await storage.updateTaskStatus(
          task.id, 
          result.success ? TaskStatus.COMPLETED : TaskStatus.FAILED
        );
      }
      
      // Create agent response message
      if (task) {
        await storage.createMessage({
          taskId: task.id,
          agentId: agent.id,
          userId: null,
          content: result.output,
          type: MessageType.AGENT
        });
      }
      
      // Broadcast activity update
      const activities = await storage.getRecentSystemActivities(10);
      broadcastMessage('ACTIVITIES_UPDATE', activities);
      
      // Broadcast stats update
      const stats = await storage.getSystemStats();
      broadcastMessage('STATS_UPDATE', stats);
      
      // Return the result
      res.json(result);
    } catch (error) {
      logger.error(`Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to process message', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Create a new project
  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid project data', details: validationResult.error });
      }
      
      const project = await storage.createProject(validationResult.data);
      res.status(201).json(project);
    } catch (error) {
      logger.error(`Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });
  
  // Get all projects
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      logger.error(`Error getting projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  
  // Get project by ID
  app.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      logger.error(`Error getting project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });
  
  // Get tasks for a project
  app.get('/api/projects/:id/tasks', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const tasks = await storage.getTasksByProject(id);
      res.json(tasks);
    } catch (error) {
      logger.error(`Error getting tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });
  
  // Get messages for a task
  app.get('/api/tasks/:id/messages', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID' });
      }
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const messages = await storage.getMessagesByTask(id);
      res.json(messages);
    } catch (error) {
      logger.error(`Error getting messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  // Get thread manager stats
  app.get('/api/thread-stats', (req: Request, res: Response) => {
    try {
      const stats = threadManager.getThreadStats();
      res.json(stats);
    } catch (error) {
      logger.error(`Error getting thread stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch thread stats' });
    }
  });
  
  // System Knowledge Base API
  
  // Get all system knowledge
  app.get('/api/system-knowledge', async (req: Request, res: Response) => {
    try {
      const componentName = req.query.componentName as string;
      const componentType = req.query.componentType as string;
      
      let knowledge;
      if (componentName) {
        knowledge = await storage.getSystemKnowledgeByComponent(componentName);
      } else if (componentType) {
        knowledge = await storage.getSystemKnowledgeByType(componentType);
      } else {
        knowledge = await storage.getAllSystemKnowledge();
      }
      
      res.json(knowledge);
    } catch (error) {
      logger.error(`Error getting system knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system knowledge' });
    }
  });
  
  // Get specific system knowledge by ID
  app.get('/api/system-knowledge/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid knowledge ID' });
      }
      
      const knowledge = await storage.getSystemKnowledge(id);
      if (!knowledge) {
        return res.status(404).json({ error: 'System knowledge not found' });
      }
      
      res.json(knowledge);
    } catch (error) {
      logger.error(`Error getting system knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system knowledge' });
    }
  });
  
  // Add new system knowledge
  app.post('/api/system-knowledge', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        componentName: z.string().min(1),
        componentType: z.string().min(1),
        description: z.string().min(1),
        functionalities: z.record(z.any()).optional(),
        dependencies: z.record(z.any()).optional(),
        errorPatterns: z.record(z.any()).optional(),
        documentation: z.string().nullable().optional(),
        exampleCode: z.string().nullable().optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid knowledge data', details: validationResult.error });
      }
      
      const knowledge = await storage.createSystemKnowledge(validationResult.data);
      res.status(201).json(knowledge);
    } catch (error) {
      logger.error(`Error creating system knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to create system knowledge' });
    }
  });
  
  // System Error Logs API
  
  // Get error logs
  app.get('/api/error-logs', async (req: Request, res: Response) => {
    try {
      const errorType = req.query.errorType as string;
      const componentName = req.query.componentName as string;
      const unsolved = req.query.unsolved === 'true';
      
      let errorLogs;
      if (errorType) {
        errorLogs = await storage.getSystemErrorLogsByType(errorType as ErrorType);
      } else if (componentName) {
        errorLogs = await storage.getSystemErrorLogsByComponent(componentName);
      } else if (unsolved) {
        errorLogs = await storage.getUnsolvedSystemErrorLogs();
      } else {
        // For safety, only allow filtered queries
        return res.status(400).json({ error: 'Please provide a filter: errorType, componentName, or unsolved=true' });
      }
      
      res.json(errorLogs);
    } catch (error) {
      logger.error(`Error getting error logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch error logs' });
    }
  });
  
  // Get all error types (for dropdown filters)
  app.get('/api/error-types', (req: Request, res: Response) => {
    try {
      const errorTypes = [
        ErrorType.SYNTAX_ERROR,
        ErrorType.RUNTIME_ERROR,
        ErrorType.LOGIC_ERROR,
        ErrorType.NETWORK_ERROR,
        ErrorType.DATABASE_ERROR,
        ErrorType.MEMORY_ERROR,
        ErrorType.THREAD_ERROR,
        ErrorType.API_ERROR,
        ErrorType.UNKNOWN
      ];
      res.json(errorTypes);
    } catch (error) {
      logger.error(`Error getting error types: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch error types' });
    }
  });
  
  // Create new error log
  app.post('/api/error-logs', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        componentName: z.string().min(1),
        errorType: z.string(),
        errorMessage: z.string().min(1),
        stackTrace: z.string().nullable().optional(),
        context: z.record(z.any()).optional(),
        attempted_fixes: z.array(z.any()).optional(),
        isSolved: z.boolean().optional(),
        solutionNotes: z.string().nullable().optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid error log data', details: validationResult.error });
      }
      
      const errorLog = await storage.createSystemErrorLog(validationResult.data);
      res.status(201).json(errorLog);
    } catch (error) {
      logger.error(`Error creating error log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to create error log' });
    }
  });
  
  // Mark error as solved
  app.patch('/api/error-logs/:id/solve', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid error log ID' });
      }
      
      const schema = z.object({
        solutionNotes: z.string().min(1)
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid solution data', details: validationResult.error });
      }
      
      const { solutionNotes } = validationResult.data;
      
      const errorLog = await storage.markSystemErrorAsSolved(id, solutionNotes);
      if (!errorLog) {
        return res.status(404).json({ error: 'Error log not found' });
      }
      
      res.json(errorLog);
    } catch (error) {
      logger.error(`Error marking error as solved: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to mark error as solved' });
    }
  });
  
  // Get agent memories
  app.get('/api/agent-memories', async (req: Request, res: Response) => {
    try {
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const type = req.query.type as string;
      
      let memories: any[] = [];
      
      if (agentId) {
        memories = await dbStorage.getAgentMemoriesByAgent(agentId);
      } else if (projectId) {
        memories = await dbStorage.getAgentMemoriesByProject(projectId);
      } else if (type) {
        memories = await dbStorage.getAgentMemoriesByType(type as any);
      } else {
        // Get all memories (limited to 100 for performance)
        const agents = await dbStorage.getAllAgents();
        for (const agent of agents) {
          const agentMemories = await dbStorage.getAgentMemoriesByAgent(agent.id);
          memories.push(...agentMemories.slice(0, 25)); // Limit per agent
        }
      }
      
      res.json(memories);
    } catch (error) {
      logger.error(`Error getting agent memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch agent memories' });
    }
  });
  
  // Get project components
  app.get('/api/project-components', async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const type = req.query.type as string;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      let components;
      if (type) {
        components = await dbStorage.getProjectComponentsByType(projectId, type as any);
      } else {
        components = await dbStorage.getProjectComponentsByProject(projectId);
      }
      
      res.json(components);
    } catch (error) {
      logger.error(`Error getting project components: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch project components' });
    }
  });
  
  // Get component relationships
  app.get('/api/component-relationships', async (req: Request, res: Response) => {
    try {
      const sourceId = req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined;
      const targetId = req.query.targetId ? parseInt(req.query.targetId as string) : undefined;
      const type = req.query.type as string;
      
      let relationships;
      if (sourceId) {
        relationships = await dbStorage.getComponentRelationshipsBySource(sourceId);
      } else if (targetId) {
        relationships = await dbStorage.getComponentRelationshipsByTarget(targetId);
      } else if (type) {
        relationships = await dbStorage.getComponentRelationshipsByType(type);
      } else {
        return res.status(400).json({ error: 'At least one filter parameter is required' });
      }
      
      res.json(relationships);
    } catch (error) {
      logger.error(`Error getting component relationships: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch component relationships' });
    }
  });
  
  // Get system knowledge
  app.get('/api/system-knowledge', async (req: Request, res: Response) => {
    try {
      const componentName = req.query.componentName as string;
      const componentType = req.query.componentType as string;
      
      let knowledgeItems;
      if (componentName) {
        knowledgeItems = await dbStorage.getSystemKnowledgeByComponent(componentName);
      } else if (componentType) {
        knowledgeItems = await dbStorage.getSystemKnowledgeByType(componentType);
      } else {
        knowledgeItems = await dbStorage.getAllSystemKnowledge();
      }
      
      res.json(knowledgeItems);
    } catch (error) {
      logger.error(`Error getting system knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system knowledge' });
    }
  });
  
  // Get system error logs
  app.get('/api/system-errors', async (req: Request, res: Response) => {
    try {
      const errorType = req.query.errorType as string;
      const componentName = req.query.componentName as string;
      const unsolvedOnly = req.query.unsolvedOnly === 'true';
      
      let errorLogs;
      if (errorType) {
        errorLogs = await dbStorage.getSystemErrorLogsByType(errorType as any);
      } else if (componentName) {
        errorLogs = await dbStorage.getSystemErrorLogsByComponent(componentName);
      } else if (unsolvedOnly) {
        errorLogs = await dbStorage.getUnsolvedSystemErrorLogs();
      } else {
        // Get recent error logs (limited to avoid performance issues)
        // This would need to be implemented in storage
        errorLogs = await dbStorage.getUnsolvedSystemErrorLogs();
      }
      
      res.json(errorLogs);
    } catch (error) {
      logger.error(`Error getting system error logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to fetch system error logs' });
    }
  });
  
  // Create a system error log
  app.post('/api/system-errors', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        errorType: z.enum([
          ErrorType.SYNTAX_ERROR,
          ErrorType.RUNTIME_ERROR,
          ErrorType.LOGIC_ERROR,
          ErrorType.NETWORK_ERROR,
          ErrorType.DATABASE_ERROR,
          ErrorType.MEMORY_ERROR,
          ErrorType.THREAD_ERROR,
          ErrorType.API_ERROR,
          ErrorType.UNKNOWN
        ]),
        componentName: z.string(),
        errorMessage: z.string(),
        stackTrace: z.string().optional(),
        metadata: z.record(z.any()).optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid error log data', details: validationResult.error });
      }
      
      const errorLog = await dbStorage.createSystemErrorLog({
        ...validationResult.data,
        isSolved: false,
        solutionNotes: null
      });
      
      // Broadcast error notification
      broadcastMessage('SYSTEM_ERROR', errorLog);
      
      res.status(201).json(errorLog);
    } catch (error) {
      logger.error(`Error creating system error log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to create system error log' });
    }
  });
  
  // Mark a system error as solved
  app.patch('/api/system-errors/:id/solved', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid error log ID' });
      }
      
      const schema = z.object({
        solutionNotes: z.string()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Solution notes are required' });
      }
      
      const { solutionNotes } = validationResult.data;
      
      const updatedErrorLog = await dbStorage.markSystemErrorAsSolved(id, solutionNotes);
      if (!updatedErrorLog) {
        return res.status(404).json({ error: 'Error log not found' });
      }
      
      // Broadcast error solved notification
      broadcastMessage('SYSTEM_ERROR_SOLVED', updatedErrorLog);
      
      res.json(updatedErrorLog);
    } catch (error) {
      logger.error(`Error marking system error as solved: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to mark system error as solved' });
    }
  });
  
  // Create system knowledge
  app.post('/api/system-knowledge', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        componentName: z.string(),
        componentType: z.string(),
        knowledgeContent: z.string(),
        source: z.string().optional(),
        metadata: z.record(z.any()).optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid system knowledge data', details: validationResult.error });
      }
      
      const systemKnowledge = await dbStorage.createSystemKnowledge(validationResult.data);
      
      res.status(201).json(systemKnowledge);
    } catch (error) {
      logger.error(`Error creating system knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to create system knowledge' });
    }
  });
  
  // Run comprehensive agent tests
  app.post('/api/run-tests', async (req: Request, res: Response) => {
    try {
      // Start the tests - this is a long operation so we'll use event-driven approach
      logger.info('Starting comprehensive agent tests');
      
      // Send an initial response
      res.status(202).json({ 
        message: 'Agent tests started',
        status: 'RUNNING'
      });
      
      // Run the tests asynchronously
      agentTester.runAllTests()
        .then(results => {
          logger.info(`Agent tests completed. Success: ${results.success}`);
          // Broadcast test completion to websocket clients
          broadcastMessage('TEST_RESULTS', { 
            status: 'COMPLETED',
            results
          });
        })
        .catch(error => {
          logger.error(`Error running agent tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Broadcast test error to websocket clients
          broadcastMessage('TEST_RESULTS', { 
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        });
      
    } catch (error) {
      logger.error(`Error starting agent tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ error: 'Failed to start agent tests' });
    }
  });

  // Setup process exit handler
  process.on('SIGINT', async () => {
    logger.info('Shutting down server...');
    await threadManager.shutdown();
    process.exit(0);
  });

  return httpServer;
}
