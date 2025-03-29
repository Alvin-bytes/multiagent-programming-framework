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
  DEBUG = 'debug',
  SELF_HEALING = 'self_healing'
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
  SYSTEM_ERROR = 'system_error',
  SYSTEM_HEALING = 'system_healing'
}

// ErrorType is now defined at the end of the file

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

// System Knowledge Base table - For self-healing agent to understand system components
export const systemKnowledgeBase = pgTable("system_knowledge_base", {
  id: serial("id").primaryKey(),
  componentName: text("component_name").notNull(),
  componentType: text("component_type").notNull(), // 'module', 'service', 'agent', 'database', etc.
  description: text("description").notNull(),
  functionalities: jsonb("functionalities"), // List of functions/capabilities
  dependencies: jsonb("dependencies"), // What this component depends on
  errorPatterns: jsonb("error_patterns"), // Common error patterns and solutions
  documentation: text("documentation"), // Detailed explanation
  exampleCode: text("example_code"), // Example usage
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertSystemKnowledgeSchema = createInsertSchema(systemKnowledgeBase).pick({
  componentName: true,
  componentType: true,
  description: true,
  functionalities: true,
  dependencies: true,
  errorPatterns: true,
  documentation: true,
  exampleCode: true
});

// System Error Logs table - For tracking errors in the system
export const systemErrorLogs = pgTable("system_error_logs", {
  id: serial("id").primaryKey(),
  errorType: text("error_type").notNull(),
  componentName: text("component_name").notNull(),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  context: jsonb("context"), // What was happening when error occurred
  attempted_fixes: jsonb("attempted_fixes"), // What has been tried to fix it
  isSolved: boolean("is_solved").default(false),
  solutionNotes: text("solution_notes"), // How it was fixed if solved
  timestamp: timestamp("timestamp").defaultNow()
});

export const insertSystemErrorLogSchema = createInsertSchema(systemErrorLogs).pick({
  errorType: true,
  componentName: true,
  errorMessage: true,
  stackTrace: true,
  context: true,
  attempted_fixes: true,
  isSolved: true,
  solutionNotes: true
});

// Add types for the new tables
export type AgentMemory = typeof agentMemories.$inferSelect;
export type InsertAgentMemory = z.infer<typeof insertAgentMemorySchema>;

export type ProjectComponent = typeof projectComponents.$inferSelect;
export type InsertProjectComponent = z.infer<typeof insertProjectComponentSchema>;

export type ComponentRelationship = typeof componentRelationships.$inferSelect;
export type InsertComponentRelationship = z.infer<typeof insertComponentRelationshipSchema>;

export type SystemKnowledge = typeof systemKnowledgeBase.$inferSelect;
export type InsertSystemKnowledge = z.infer<typeof insertSystemKnowledgeSchema>;

export type SystemErrorLog = typeof systemErrorLogs.$inferSelect;
export type InsertSystemErrorLog = z.infer<typeof insertSystemErrorLogSchema>;

// Define error types for self-healing agent
export enum ErrorType {
  RUNTIME_ERROR = 'runtime_error',
  SYNTAX_ERROR = 'syntax_error',
  LOGIC_ERROR = 'logic_error',
  VALIDATION_ERROR = 'validation_error',
  API_ERROR = 'api_error',
  DATABASE_ERROR = 'database_error',
  NETWORK_ERROR = 'network_error',
  MEMORY_ERROR = 'memory_error',
  THREAD_ERROR = 'thread_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  RESOURCE_ERROR = 'resource_error',
  CONFIGURATION_ERROR = 'configuration_error',
  DEPENDENCY_ERROR = 'dependency_error',
  SYSTEM_ERROR = 'system_error',
  UNKNOWN = 'unknown'
}
