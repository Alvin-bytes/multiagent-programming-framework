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
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, gt, lt, desc, asc, isNull, isNotNull } from "drizzle-orm";
import { logger } from "./utils/logger";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Agent operations
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAgentByName(name: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.name, name));
    return agent || undefined;
  }

  async getAgentsByType(type: AgentType): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.type, type));
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgentStatus(id: number, status: AgentStatus): Promise<Agent | undefined> {
    const [agent] = await db.update(agents)
      .set({ status, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task | undefined> {
    const [task] = await db.update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByTask(taskId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.taskId, taskId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // System Activity operations
  async getSystemActivity(id: number): Promise<SystemActivity | undefined> {
    const [activity] = await db.select().from(systemActivities).where(eq(systemActivities.id, id));
    return activity || undefined;
  }

  async getRecentSystemActivities(limit: number): Promise<SystemActivity[]> {
    return await db.select().from(systemActivities)
      .orderBy(desc(systemActivities.createdAt))
      .limit(limit);
  }

  async createSystemActivity(insertActivity: InsertSystemActivity): Promise<SystemActivity> {
    const [activity] = await db.insert(systemActivities).values(insertActivity).returning();
    return activity;
  }

  // System Stats operations
  async getSystemStats(): Promise<SystemStats | undefined> {
    const [stats] = await db.select().from(systemStats).where(eq(systemStats.id, 1));
    return stats || undefined;
  }

  async updateSystemStats(partialStats: Partial<InsertSystemStats>): Promise<SystemStats | undefined> {
    const [stats] = await db.select().from(systemStats).where(eq(systemStats.id, 1));
    
    if (!stats) {
      // Create initial stats if they don't exist
      const [newStats] = await db.insert(systemStats)
        .values({ id: 1, ...partialStats, updatedAt: new Date() })
        .returning();
      return newStats;
    }
    
    // Update existing stats
    const [updatedStats] = await db.update(systemStats)
      .set({ ...partialStats, updatedAt: new Date() })
      .where(eq(systemStats.id, 1))
      .returning();
    
    return updatedStats || undefined;
  }

  // Agent Memory operations
  async getAgentMemory(id: number): Promise<AgentMemory | undefined> {
    const [memory] = await db.select().from(agentMemories).where(eq(agentMemories.id, id));
    return memory || undefined;
  }

  async getAgentMemoriesByAgent(agentId: number): Promise<AgentMemory[]> {
    return await db.select().from(agentMemories)
      .where(eq(agentMemories.agentId, agentId))
      .orderBy(desc(agentMemories.importance), desc(agentMemories.updatedAt));
  }

  async getAgentMemoriesByProject(projectId: number): Promise<AgentMemory[]> {
    return await db.select().from(agentMemories)
      .where(eq(agentMemories.projectId, projectId))
      .orderBy(desc(agentMemories.importance), desc(agentMemories.updatedAt));
  }

  async getAgentMemoriesByType(type: MemoryType): Promise<AgentMemory[]> {
    return await db.select().from(agentMemories)
      .where(eq(agentMemories.type, type))
      .orderBy(desc(agentMemories.importance), desc(agentMemories.updatedAt));
  }

  async createAgentMemory(memory: InsertAgentMemory): Promise<AgentMemory> {
    const [newMemory] = await db.insert(agentMemories).values(memory).returning();
    return newMemory;
  }

  async updateAgentMemoryAccessInfo(id: number): Promise<AgentMemory | undefined> {
    const [memory] = await db.select().from(agentMemories).where(eq(agentMemories.id, id));
    if (!memory) return undefined;

    const [updatedMemory] = await db.update(agentMemories)
      .set({ 
        lastAccessed: new Date(),
        accessCount: (memory.accessCount || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(agentMemories.id, id))
      .returning();
      
    return updatedMemory || undefined;
  }

  async deleteExpiredMemories(): Promise<void> {
    const now = new Date();
    // Delete all memories that have an expiresAt date in the past
    await db.delete(agentMemories)
      .where(
        and(
          isNotNull(agentMemories.expiresAt),
          lt(agentMemories.expiresAt as any, now)
        )
      );
    
    logger.info('Expired memories cleaned up');
  }

  // Project Component operations
  async getProjectComponent(id: number): Promise<ProjectComponent | undefined> {
    const [component] = await db.select().from(projectComponents).where(eq(projectComponents.id, id));
    return component || undefined;
  }

  async getProjectComponentsByProject(projectId: number): Promise<ProjectComponent[]> {
    return await db.select().from(projectComponents)
      .where(eq(projectComponents.projectId, projectId));
  }

  async getProjectComponentsByType(projectId: number, type: ComponentType): Promise<ProjectComponent[]> {
    return await db.select().from(projectComponents)
      .where(
        and(
          eq(projectComponents.projectId, projectId),
          eq(projectComponents.type, type)
        )
      );
  }

  async createProjectComponent(component: InsertProjectComponent): Promise<ProjectComponent> {
    const [newComponent] = await db.insert(projectComponents).values(component).returning();
    return newComponent;
  }

  async updateProjectComponent(id: number, component: Partial<InsertProjectComponent>): Promise<ProjectComponent | undefined> {
    const [updatedComponent] = await db.update(projectComponents)
      .set({ ...component, updatedAt: new Date() })
      .where(eq(projectComponents.id, id))
      .returning();
    
    return updatedComponent || undefined;
  }

  // Component Relationship operations
  async getComponentRelationship(id: number): Promise<ComponentRelationship | undefined> {
    const [relationship] = await db.select().from(componentRelationships).where(eq(componentRelationships.id, id));
    return relationship || undefined;
  }

  async getComponentRelationshipsBySource(sourceComponentId: number): Promise<ComponentRelationship[]> {
    return await db.select().from(componentRelationships)
      .where(eq(componentRelationships.sourceComponentId, sourceComponentId));
  }

  async getComponentRelationshipsByTarget(targetComponentId: number): Promise<ComponentRelationship[]> {
    return await db.select().from(componentRelationships)
      .where(eq(componentRelationships.targetComponentId, targetComponentId));
  }

  async getComponentRelationshipsByType(relationshipType: string): Promise<ComponentRelationship[]> {
    return await db.select().from(componentRelationships)
      .where(eq(componentRelationships.relationshipType, relationshipType));
  }

  async createComponentRelationship(relationship: InsertComponentRelationship): Promise<ComponentRelationship> {
    const [newRelationship] = await db.insert(componentRelationships).values(relationship).returning();
    return newRelationship;
  }
  
  // System Knowledge Base operations
  async getSystemKnowledge(id: number): Promise<SystemKnowledge | undefined> {
    const [knowledge] = await db.select().from(systemKnowledgeBase).where(eq(systemKnowledgeBase.id, id));
    return knowledge || undefined;
  }
  
  async getSystemKnowledgeByComponent(componentName: string): Promise<SystemKnowledge | undefined> {
    const [knowledge] = await db.select().from(systemKnowledgeBase)
      .where(eq(systemKnowledgeBase.componentName, componentName));
    return knowledge || undefined;
  }
  
  async getSystemKnowledgeByType(componentType: string): Promise<SystemKnowledge[]> {
    return await db.select().from(systemKnowledgeBase)
      .where(eq(systemKnowledgeBase.componentType, componentType));
  }
  
  async getAllSystemKnowledge(): Promise<SystemKnowledge[]> {
    return await db.select().from(systemKnowledgeBase)
      .orderBy(desc(systemKnowledgeBase.lastUpdated));
  }
  
  async createSystemKnowledge(knowledge: InsertSystemKnowledge): Promise<SystemKnowledge> {
    const [newKnowledge] = await db.insert(systemKnowledgeBase)
      .values({
        ...knowledge,
        lastUpdated: new Date()
      })
      .returning();
    return newKnowledge;
  }
  
  async updateSystemKnowledge(id: number, partialKnowledge: Partial<InsertSystemKnowledge>): Promise<SystemKnowledge | undefined> {
    const [updatedKnowledge] = await db.update(systemKnowledgeBase)
      .set({
        ...partialKnowledge,
        lastUpdated: new Date()
      })
      .where(eq(systemKnowledgeBase.id, id))
      .returning();
    return updatedKnowledge || undefined;
  }
  
  // System Error Logs operations
  async getSystemErrorLog(id: number): Promise<SystemErrorLog | undefined> {
    const [errorLog] = await db.select().from(systemErrorLogs).where(eq(systemErrorLogs.id, id));
    return errorLog || undefined;
  }
  
  async getSystemErrorLogsByType(errorType: ErrorType): Promise<SystemErrorLog[]> {
    return await db.select().from(systemErrorLogs)
      .where(eq(systemErrorLogs.errorType, errorType))
      .orderBy(desc(systemErrorLogs.timestamp));
  }
  
  async getSystemErrorLogsByComponent(componentName: string): Promise<SystemErrorLog[]> {
    return await db.select().from(systemErrorLogs)
      .where(eq(systemErrorLogs.componentName, componentName))
      .orderBy(desc(systemErrorLogs.timestamp));
  }
  
  async getUnsolvedSystemErrorLogs(): Promise<SystemErrorLog[]> {
    return await db.select().from(systemErrorLogs)
      .where(eq(systemErrorLogs.isSolved, false))
      .orderBy(desc(systemErrorLogs.timestamp));
  }
  
  async createSystemErrorLog(errorLog: InsertSystemErrorLog): Promise<SystemErrorLog> {
    const [newErrorLog] = await db.insert(systemErrorLogs)
      .values(errorLog)
      .returning();
    return newErrorLog;
  }
  
  async updateSystemErrorLog(id: number, partialErrorLog: Partial<InsertSystemErrorLog>): Promise<SystemErrorLog | undefined> {
    const [updatedErrorLog] = await db.update(systemErrorLogs)
      .set(partialErrorLog)
      .where(eq(systemErrorLogs.id, id))
      .returning();
    return updatedErrorLog || undefined;
  }
  
  async markSystemErrorAsSolved(id: number, solutionNotes: string): Promise<SystemErrorLog | undefined> {
    const [updatedErrorLog] = await db.update(systemErrorLogs)
      .set({
        isSolved: true,
        solutionNotes
      })
      .where(eq(systemErrorLogs.id, id))
      .returning();
    return updatedErrorLog || undefined;
  }
}

// Initialize and export a singleton instance
export const dbStorage = new DatabaseStorage();