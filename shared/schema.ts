import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("inactive"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  type: true,
  status: true,
  isActive: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  userId: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  projectId: true,
  description: true,
  status: true,
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  agentId: integer("agent_id").references(() => agents.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'user', 'agent', 'system'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  taskId: true,
  agentId: true,
  userId: true,
  content: true,
  type: true,
});

// System Activities table
export const systemActivities = pgTable("system_activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'api_call', 'thread_allocation', 'memory_usage', etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSystemActivitySchema = createInsertSchema(systemActivities).pick({
  type: true,
  description: true,
  metadata: true,
});

// System Stats table
export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  apiTokensUsed: integer("api_tokens_used").notNull().default(0),
  apiTokensLimit: integer("api_tokens_limit").notNull().default(10000),
  memoryUsed: integer("memory_used").notNull().default(0),
  memoryLimit: integer("memory_limit").notNull().default(1024),
  activeThreads: integer("active_threads").notNull().default(0),
  threadLimit: integer("thread_limit").notNull().default(8),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemStatsSchema = createInsertSchema(systemStats).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type SystemActivity = typeof systemActivities.$inferSelect;
export type InsertSystemActivity = z.infer<typeof insertSystemActivitySchema>;

export type SystemStats = typeof systemStats.$inferSelect;
export type InsertSystemStats = z.infer<typeof insertSystemStatsSchema>;

// Enums
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

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MessageType {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export enum ActivityType {
  API_CALL = 'api_call',
  THREAD_ALLOCATION = 'thread_allocation',
  MEMORY_USAGE = 'memory_usage',
  AGENT_STATUS_CHANGE = 'agent_status_change',
  SYSTEM_ERROR = 'system_error'
}

// Memory type enum
export enum MemoryType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
  PROCEDURAL = 'procedural',
  EPISODIC = 'episodic'
}

// Component type enum
export enum ComponentType {
  UI = 'ui',
  API = 'api',
  DATABASE = 'database',
  LOGIC = 'logic',
  UTILITY = 'utility'
}

// Agent Memory table - For both short and long-term memories
export const agentMemories = pgTable("agent_memories", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  type: text("type").notNull(), // MemoryType enum
  content: text("content").notNull(),
  context: jsonb("context"), // Additional context about the memory
  importance: integer("importance").notNull().default(1), // 1-10 rating of importance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // NULL for long-term memories
  lastAccessed: timestamp("last_accessed"), // Track when memory was last retrieved
  accessCount: integer("access_count").notNull().default(0) // How many times was this memory accessed
});

export const insertAgentMemorySchema = createInsertSchema(agentMemories).pick({
  agentId: true,
  projectId: true,
  type: true,
  content: true,
  context: true,
  importance: true,
  expiresAt: true
});

// Project Components table - To track project structure
export const projectComponents = pgTable("project_components", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // ComponentType enum
  path: text("path"), // File/folder path if applicable
  description: text("description"),
  metadata: jsonb("metadata"), // Additional info about the component
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertProjectComponentSchema = createInsertSchema(projectComponents).pick({
  projectId: true,
  name: true,
  type: true,
  path: true,
  description: true,
  metadata: true
});

// Component Relationships table - To understand how components interact
export const componentRelationships = pgTable("component_relationships", {
  id: serial("id").primaryKey(),
  sourceComponentId: integer("source_component_id").references(() => projectComponents.id).notNull(),
  targetComponentId: integer("target_component_id").references(() => projectComponents.id).notNull(),
  relationshipType: text("relationship_type").notNull(), // 'imports', 'calls', 'uses', 'extends', etc.
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertComponentRelationshipSchema = createInsertSchema(componentRelationships).pick({
  sourceComponentId: true,
  targetComponentId: true,
  relationshipType: true,
  description: true,
  metadata: true
});

// Add types for the new tables
export type AgentMemory = typeof agentMemories.$inferSelect;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;

export type ProjectComponent = typeof projectComponents.$inferSelect;
export type InsertProjectComponent = z.infer<typeof insertProjectComponentSchema>;

export type ComponentRelationship = typeof componentRelationships.$inferSelect;
export type InsertComponentRelationship = z.infer<typeof insertComponentRelationshipSchema>;
