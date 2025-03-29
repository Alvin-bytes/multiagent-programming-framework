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
  AgentType, AgentStatus, TaskStatus, MessageType, ActivityType, MemoryType, ComponentType
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
}

// Note: MemStorage is only implementing a subset of IStorage methods
// Since we're transitioning to DatabaseStorage, these methods will be removed
// in a future update. For now, this is kept for backward compatibility.
export class MemStorage /* implements partial IStorage */ {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private messages: Map<number, Message>;
  private systemActivities: Map<number, SystemActivity>;
  private systemStats: SystemStats | undefined;

  private userIdCounter: number;
  private agentIdCounter: number;
  private projectIdCounter: number;
  private taskIdCounter: number;
  private messageIdCounter: number;
  private systemActivityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.messages = new Map();
    this.systemActivities = new Map();

    this.userIdCounter = 1;
    this.agentIdCounter = 1;
    this.projectIdCounter = 1;
    this.taskIdCounter = 1;
    this.messageIdCounter = 1;
    this.systemActivityIdCounter = 1;

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
      { name: 'Debug Agent', type: AgentType.DEBUG, status: AgentStatus.STANDBY, isActive: true }
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
}

export const storage = new MemStorage();
