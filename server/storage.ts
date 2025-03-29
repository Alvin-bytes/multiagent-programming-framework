import {
  users, type User, type InsertUser,
  agents, type Agent, type InsertAgent,
  projects, type Project, type InsertProject,
  tasks, type Task, type InsertTask,
  messages, type Message, type InsertMessage,
  systemActivities, type SystemActivity, type InsertSystemActivity,
  systemStats, type SystemStats, type InsertSystemStats,
  agentMemories, type AgentMemory, type InsertAgentMemory,
  projectComponents, type ProjectComponent, type InsertProjectComponent,
  componentRelationships, type ComponentRelationship, type InsertComponentRelationship,
  systemKnowledgeBase, type SystemKnowledge, type InsertSystemKnowledge,
  systemErrorLogs, type SystemErrorLog, type InsertSystemErrorLog,
  AgentType, AgentStatus, TaskStatus, MessageType, ActivityType, MemoryType, ComponentType, ErrorType
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Agent operations
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByName(name: string): Promise<Agent | undefined>;
  getAgentsByType(type: AgentType): Promise<Agent[]>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: number, status: AgentStatus): Promise<Agent | undefined>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: TaskStatus): Promise<Task | undefined>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByTask(taskId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // System Activity operations
  getSystemActivity(id: number): Promise<SystemActivity | undefined>;
  getRecentSystemActivities(limit: number): Promise<SystemActivity[]>;
  createSystemActivity(activity: InsertSystemActivity): Promise<SystemActivity>;

  // System Stats operations
  getSystemStats(): Promise<SystemStats | undefined>;
  updateSystemStats(stats: Partial<InsertSystemStats>): Promise<SystemStats | undefined>;
  
  // Agent Memory operations
  getAgentMemory(id: number): Promise<AgentMemory | undefined>;
  getAgentMemoriesByAgent(agentId: number): Promise<AgentMemory[]>;
  getAgentMemoriesByProject(projectId: number): Promise<AgentMemory[]>; 
  getAgentMemoriesByType(type: MemoryType): Promise<AgentMemory[]>;
  createAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory>;
  updateAgentMemoryAccessInfo(id: number): Promise<AgentMemory | undefined>;
  deleteExpiredMemories(): Promise<void>;
  
  // Project Component operations
  getProjectComponent(id: number): Promise<ProjectComponent | undefined>;
  getProjectComponentsByProject(projectId: number): Promise<ProjectComponent[]>;
  getProjectComponentsByType(projectId: number, type: ComponentType): Promise<ProjectComponent[]>;
  createProjectComponent(component: InsertProjectComponent): Promise<ProjectComponent>;
  updateProjectComponent(id: number, component: Partial<InsertProjectComponent>): Promise<ProjectComponent | undefined>;
  
  // Component Relationship operations
  getComponentRelationship(id: number): Promise<ComponentRelationship | undefined>;
  getComponentRelationshipsBySource(sourceComponentId: number): Promise<ComponentRelationship[]>;
  getComponentRelationshipsByTarget(targetComponentId: number): Promise<ComponentRelationship[]>;
  getComponentRelationshipsByType(relationshipType: string): Promise<ComponentRelationship[]>;
  createComponentRelationship(relationship: InsertComponentRelationship): Promise<ComponentRelationship>;

  // System Knowledge Base operations for self-healing agent
  getSystemKnowledge(id: number): Promise<SystemKnowledge | undefined>;
  getSystemKnowledgeByComponent(componentName: string): Promise<SystemKnowledge | undefined>;
  getSystemKnowledgeByType(componentType: string): Promise<SystemKnowledge[]>;
  getAllSystemKnowledge(): Promise<SystemKnowledge[]>;
  createSystemKnowledge(knowledge: InsertSystemKnowledge): Promise<SystemKnowledge>;
  updateSystemKnowledge(id: number, knowledge: Partial<InsertSystemKnowledge>): Promise<SystemKnowledge | undefined>;
  
  // System Error Logs operations for self-healing agent
  getSystemErrorLog(id: number): Promise<SystemErrorLog | undefined>;
  getSystemErrorLogsByType(errorType: ErrorType): Promise<SystemErrorLog[]>;
  getSystemErrorLogsByComponent(componentName: string): Promise<SystemErrorLog[]>;
  getUnsolvedSystemErrorLogs(): Promise<SystemErrorLog[]>;
  createSystemErrorLog(errorLog: InsertSystemErrorLog): Promise<SystemErrorLog>;
  updateSystemErrorLog(id: number, errorLog: Partial<InsertSystemErrorLog>): Promise<SystemErrorLog | undefined>;
  markSystemErrorAsSolved(id: number, solutionNotes: string): Promise<SystemErrorLog | undefined>;
}

// Note: MemStorage is only implementing a subset of IStorage methods
// Since we're transitioning to DatabaseStorage, these methods will be removed
// in a future update. For now, this is kept for backward compatibility.
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private messages: Map<number, Message>;
  private systemActivities: Map<number, SystemActivity>;
  private systemStats: SystemStats | undefined;
  private systemKnowledge: Map<number, SystemKnowledge>;
  private systemErrorLogs: Map<number, SystemErrorLog>;
  private agentMemories: Map<number, AgentMemory>;
  private projectComponents: Map<number, ProjectComponent>;
  private componentRelationships: Map<number, ComponentRelationship>;

  private userIdCounter: number;
  private agentIdCounter: number;
  private projectIdCounter: number;
  private taskIdCounter: number;
  private messageIdCounter: number;
  private systemActivityIdCounter: number;
  private systemKnowledgeIdCounter: number;
  private systemErrorLogIdCounter: number;
  private agentMemoryIdCounter: number;
  private projectComponentIdCounter: number;
  private componentRelationshipIdCounter: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.messages = new Map();
    this.systemActivities = new Map();
    this.systemKnowledge = new Map();
    this.systemErrorLogs = new Map();
    this.agentMemories = new Map();
    this.projectComponents = new Map();
    this.componentRelationships = new Map();

    this.userIdCounter = 1;
    this.agentIdCounter = 1;
    this.projectIdCounter = 1;
    this.taskIdCounter = 1;
    this.messageIdCounter = 1;
    this.systemActivityIdCounter = 1;
    this.systemKnowledgeIdCounter = 1;
    this.systemErrorLogIdCounter = 1;
    this.agentMemoryIdCounter = 1;
    this.projectComponentIdCounter = 1;
    this.componentRelationshipIdCounter = 1;

    // Initialize default system stats
    this.systemStats = {
      id: 1,
      apiTokensUsed: 0,
      apiTokensLimit: 10000,
      memoryUsed: 0,
      memoryLimit: 1024,
      activeThreads: 0,
      threadLimit: 8,
      updatedAt: new Date()
    };

    // Initialize default agents
    this.initDefaultAgents();
  }

  private initDefaultAgents() {
    const defaultAgents: InsertAgent[] = [
      { name: 'Design Agent', type: AgentType.DESIGN, status: AgentStatus.ACTIVE, isActive: true },
      { name: 'Coding Agent', type: AgentType.CODING, status: AgentStatus.IDLE, isActive: true },
      { name: 'Supervision Agent', type: AgentType.SUPERVISION, status: AgentStatus.OBSERVING, isActive: true },
      { name: 'Debug Agent', type: AgentType.DEBUG, status: AgentStatus.STANDBY, isActive: true },
      { name: 'Self-Healing Agent', type: AgentType.SELF_HEALING, status: AgentStatus.STANDBY, isActive: true }
    ];

    defaultAgents.forEach(agent => this.createAgent(agent));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Agent operations
  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAgentByName(name: string): Promise<Agent | undefined> {
    return Array.from(this.agents.values()).find(agent => agent.name === name);
  }

  async getAgentsByType(type: AgentType): Promise<Agent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.agentIdCounter++;
    const now = new Date();
    const agent: Agent = {
      ...insertAgent,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgentStatus(id: number, status: AgentStatus): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;

    const updatedAgent: Agent = {
      ...agent,
      status,
      updatedAt: new Date()
    };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.projectId === projectId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const task: Task = {
      ...insertTask,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByTask(taskId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.taskId === taskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // System Activity operations
  async getSystemActivity(id: number): Promise<SystemActivity | undefined> {
    return this.systemActivities.get(id);
  }

  async getRecentSystemActivities(limit: number): Promise<SystemActivity[]> {
    return Array.from(this.systemActivities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createSystemActivity(insertActivity: InsertSystemActivity): Promise<SystemActivity> {
    const id = this.systemActivityIdCounter++;
    const activity: SystemActivity = {
      ...insertActivity,
      id,
      createdAt: new Date()
    };
    this.systemActivities.set(id, activity);
    return activity;
  }

  // System Stats operations
  async getSystemStats(): Promise<SystemStats | undefined> {
    return this.systemStats;
  }

  async updateSystemStats(partialStats: Partial<InsertSystemStats>): Promise<SystemStats | undefined> {
    if (!this.systemStats) return undefined;

    this.systemStats = {
      ...this.systemStats,
      ...partialStats,
      updatedAt: new Date()
    };

    return this.systemStats;
  }
  
  // Agent Memory operations
  async getAgentMemory(id: number): Promise<AgentMemory | undefined> {
    return this.agentMemories.get(id);
  }
  
  async getAgentMemoriesByAgent(agentId: number): Promise<AgentMemory[]> {
    return Array.from(this.agentMemories.values()).filter(memory => memory.agentId === agentId);
  }
  
  async getAgentMemoriesByProject(projectId: number): Promise<AgentMemory[]> {
    return Array.from(this.agentMemories.values()).filter(memory => memory.projectId === projectId);
  }
  
  async getAgentMemoriesByType(type: MemoryType): Promise<AgentMemory[]> {
    return Array.from(this.agentMemories.values()).filter(memory => memory.memoryType === type);
  }
  
  async createAgentMemory(insertMemory: InsertAgentMemory): Promise<AgentMemory> {
    const id = this.agentMemoryIdCounter++;
    const now = new Date();
    const memory: AgentMemory = {
      ...insertMemory,
      id,
      createdAt: now,
      lastAccessed: now
    };
    this.agentMemories.set(id, memory);
    return memory;
  }
  
  async updateAgentMemoryAccessInfo(id: number): Promise<AgentMemory | undefined> {
    const memory = this.agentMemories.get(id);
    if (!memory) return undefined;
    
    const updatedMemory: AgentMemory = {
      ...memory,
      accessCount: (memory.accessCount || 0) + 1,
      lastAccessed: new Date()
    };
    this.agentMemories.set(id, updatedMemory);
    return updatedMemory;
  }
  
  async deleteExpiredMemories(): Promise<void> {
    // In memory storage, we don't auto-expire memories
    // In a real DB implementation, this would delete old memories
    return;
  }
  
  // Project Component operations
  async getProjectComponent(id: number): Promise<ProjectComponent | undefined> {
    return this.projectComponents.get(id);
  }
  
  async getProjectComponentsByProject(projectId: number): Promise<ProjectComponent[]> {
    return Array.from(this.projectComponents.values()).filter(component => component.projectId === projectId);
  }
  
  async getProjectComponentsByType(projectId: number, type: ComponentType): Promise<ProjectComponent[]> {
    return Array.from(this.projectComponents.values())
      .filter(component => component.projectId === projectId && component.componentType === type);
  }
  
  async createProjectComponent(insertComponent: InsertProjectComponent): Promise<ProjectComponent> {
    const id = this.projectComponentIdCounter++;
    const now = new Date();
    const component: ProjectComponent = {
      ...insertComponent,
      id,
      createdAt: now
    };
    this.projectComponents.set(id, component);
    return component;
  }
  
  async updateProjectComponent(id: number, partialComponent: Partial<InsertProjectComponent>): Promise<ProjectComponent | undefined> {
    const component = this.projectComponents.get(id);
    if (!component) return undefined;
    
    const updatedComponent: ProjectComponent = {
      ...component,
      ...partialComponent
    };
    this.projectComponents.set(id, updatedComponent);
    return updatedComponent;
  }
  
  // Component Relationship operations
  async getComponentRelationship(id: number): Promise<ComponentRelationship | undefined> {
    return this.componentRelationships.get(id);
  }
  
  async getComponentRelationshipsBySource(sourceComponentId: number): Promise<ComponentRelationship[]> {
    return Array.from(this.componentRelationships.values())
      .filter(relationship => relationship.sourceComponentId === sourceComponentId);
  }
  
  async getComponentRelationshipsByTarget(targetComponentId: number): Promise<ComponentRelationship[]> {
    return Array.from(this.componentRelationships.values())
      .filter(relationship => relationship.targetComponentId === targetComponentId);
  }
  
  async getComponentRelationshipsByType(relationshipType: string): Promise<ComponentRelationship[]> {
    return Array.from(this.componentRelationships.values())
      .filter(relationship => relationship.relationshipType === relationshipType);
  }
  
  async createComponentRelationship(insertRelationship: InsertComponentRelationship): Promise<ComponentRelationship> {
    const id = this.componentRelationshipIdCounter++;
    const now = new Date();
    const relationship: ComponentRelationship = {
      ...insertRelationship,
      id,
      createdAt: now
    };
    this.componentRelationships.set(id, relationship);
    return relationship;
  }
  
  // System Knowledge Base operations for self-healing agent
  async getSystemKnowledge(id: number): Promise<SystemKnowledge | undefined> {
    return this.systemKnowledge.get(id);
  }
  
  async getSystemKnowledgeByComponent(componentName: string): Promise<SystemKnowledge | undefined> {
    return Array.from(this.systemKnowledge.values()).find(knowledge => knowledge.componentName === componentName);
  }
  
  async getSystemKnowledgeByType(componentType: string): Promise<SystemKnowledge[]> {
    return Array.from(this.systemKnowledge.values()).filter(knowledge => knowledge.componentType === componentType);
  }
  
  async getAllSystemKnowledge(): Promise<SystemKnowledge[]> {
    return Array.from(this.systemKnowledge.values());
  }
  
  async createSystemKnowledge(insertKnowledge: InsertSystemKnowledge): Promise<SystemKnowledge> {
    const id = this.systemKnowledgeIdCounter++;
    const now = new Date();
    const knowledge: SystemKnowledge = {
      ...insertKnowledge,
      id,
      createdAt: now,
      lastUpdated: now
    };
    this.systemKnowledge.set(id, knowledge);
    return knowledge;
  }
  
  async updateSystemKnowledge(id: number, partialKnowledge: Partial<InsertSystemKnowledge>): Promise<SystemKnowledge | undefined> {
    const knowledge = this.systemKnowledge.get(id);
    if (!knowledge) return undefined;
    
    const updatedKnowledge: SystemKnowledge = {
      ...knowledge,
      ...partialKnowledge,
      lastUpdated: new Date()
    };
    this.systemKnowledge.set(id, updatedKnowledge);
    return updatedKnowledge;
  }
  
  // System Error Logs operations for self-healing agent
  async getSystemErrorLog(id: number): Promise<SystemErrorLog | undefined> {
    return this.systemErrorLogs.get(id);
  }
  
  async getSystemErrorLogsByType(errorType: ErrorType): Promise<SystemErrorLog[]> {
    return Array.from(this.systemErrorLogs.values()).filter(log => log.errorType === errorType);
  }
  
  async getSystemErrorLogsByComponent(componentName: string): Promise<SystemErrorLog[]> {
    return Array.from(this.systemErrorLogs.values()).filter(log => log.componentName === componentName);
  }
  
  async getUnsolvedSystemErrorLogs(): Promise<SystemErrorLog[]> {
    return Array.from(this.systemErrorLogs.values()).filter(log => !log.isSolved);
  }
  
  async createSystemErrorLog(insertErrorLog: InsertSystemErrorLog): Promise<SystemErrorLog> {
    const id = this.systemErrorLogIdCounter++;
    const now = new Date();
    const errorLog: SystemErrorLog = {
      ...insertErrorLog,
      id,
      timestamp: now
    };
    this.systemErrorLogs.set(id, errorLog);
    return errorLog;
  }
  
  async updateSystemErrorLog(id: number, partialErrorLog: Partial<InsertSystemErrorLog>): Promise<SystemErrorLog | undefined> {
    const errorLog = this.systemErrorLogs.get(id);
    if (!errorLog) return undefined;
    
    const updatedErrorLog: SystemErrorLog = {
      ...errorLog,
      ...partialErrorLog
    };
    this.systemErrorLogs.set(id, updatedErrorLog);
    return updatedErrorLog;
  }
  
  async markSystemErrorAsSolved(id: number, solutionNotes: string): Promise<SystemErrorLog | undefined> {
    const errorLog = this.systemErrorLogs.get(id);
    if (!errorLog) return undefined;
    
    const updatedErrorLog: SystemErrorLog = {
      ...errorLog,
      isSolved: true,
      solutionNotes
    };
    this.systemErrorLogs.set(id, updatedErrorLog);
    return updatedErrorLog;
  }

  // System Knowledge Base operations
  async getSystemKnowledge(id: number): Promise<SystemKnowledge | undefined> {
    return this.systemKnowledge.get(id);
  }

  async getSystemKnowledgeByComponent(componentName: string): Promise<SystemKnowledge | undefined> {
    for (const knowledge of this.systemKnowledge.values()) {
      if (knowledge.componentName === componentName) {
        return knowledge;
      }
    }
    return undefined;
  }

  async getSystemKnowledgeByType(componentType: string): Promise<SystemKnowledge[]> {
    const result: SystemKnowledge[] = [];
    for (const knowledge of this.systemKnowledge.values()) {
      if (knowledge.componentType === componentType) {
        result.push(knowledge);
      }
    }
    return result;
  }

  async getAllSystemKnowledge(): Promise<SystemKnowledge[]> {
    return Array.from(this.systemKnowledge.values())
      .sort((a, b) => {
        if (!a.lastUpdated || !b.lastUpdated) return 0;
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
  }

  async createSystemKnowledge(insertKnowledge: InsertSystemKnowledge): Promise<SystemKnowledge> {
    const id = this.systemKnowledgeIdCounter++;
    
    const knowledge: SystemKnowledge = {
      ...insertKnowledge,
      id,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    this.systemKnowledge.set(id, knowledge);
    return knowledge;
  }

  async updateSystemKnowledge(id: number, partialKnowledge: Partial<InsertSystemKnowledge>): Promise<SystemKnowledge | undefined> {
    const knowledge = this.systemKnowledge.get(id);
    if (!knowledge) return undefined;
    
    const updatedKnowledge: SystemKnowledge = {
      ...knowledge,
      ...partialKnowledge,
      lastUpdated: new Date()
    };
    
    this.systemKnowledge.set(id, updatedKnowledge);
    return updatedKnowledge;
  }

  // System Error Logs operations
  async getSystemErrorLog(id: number): Promise<SystemErrorLog | undefined> {
    return this.systemErrorLogs.get(id);
  }

  async getSystemErrorLogsByType(errorType: ErrorType): Promise<SystemErrorLog[]> {
    const result: SystemErrorLog[] = [];
    for (const errorLog of this.systemErrorLogs.values()) {
      if (errorLog.errorType === errorType) {
        result.push(errorLog);
      }
    }
    // Sort by timestamp (most recent first)
    return result.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  async getSystemErrorLogsByComponent(componentName: string): Promise<SystemErrorLog[]> {
    const result: SystemErrorLog[] = [];
    for (const errorLog of this.systemErrorLogs.values()) {
      if (errorLog.componentName === componentName) {
        result.push(errorLog);
      }
    }
    // Sort by timestamp (most recent first)
    return result.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  async getUnsolvedSystemErrorLogs(): Promise<SystemErrorLog[]> {
    const result: SystemErrorLog[] = [];
    for (const errorLog of this.systemErrorLogs.values()) {
      if (errorLog.isSolved === false) {
        result.push(errorLog);
      }
    }
    // Sort by timestamp (most recent first)
    return result.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  async createSystemErrorLog(insertErrorLog: InsertSystemErrorLog): Promise<SystemErrorLog> {
    const id = this.systemErrorLogIdCounter++;
    
    const errorLog: SystemErrorLog = {
      ...insertErrorLog,
      id,
      timestamp: new Date()
    };
    
    this.systemErrorLogs.set(id, errorLog);
    return errorLog;
  }

  async updateSystemErrorLog(id: number, partialErrorLog: Partial<InsertSystemErrorLog>): Promise<SystemErrorLog | undefined> {
    const errorLog = this.systemErrorLogs.get(id);
    if (!errorLog) return undefined;
    
    const updatedErrorLog: SystemErrorLog = {
      ...errorLog,
      ...partialErrorLog
    };
    
    this.systemErrorLogs.set(id, updatedErrorLog);
    return updatedErrorLog;
  }
}

export const storage = new MemStorage();
