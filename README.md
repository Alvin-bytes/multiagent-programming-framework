
# Multi-Agent Programming Framework

A sophisticated multi-agent framework designed to streamline complex software development tasks through intelligent, specialized agents. This system orchestrates a collaborative AI ecosystem for efficient and automated programming solutions.

## Overview

The Multi-Agent Programming Framework is a state-of-the-art system that harnesses multiple specialized AI agents to automate and enhance the software development process. By breaking down complex programming tasks into specialized domains, the system achieves higher quality results and greater efficiency than single-model approaches.

Each agent in the system is fine-tuned for specific aspects of the development process, from high-level design to low-level implementation, debugging, supervision, and system maintenance. These agents collaborate seamlessly through a shared memory system and coordinated workflow management.

## Agent System Architecture

Our framework employs a multi-agent architecture with five specialized agents, each handling different aspects of the software development process:

### 1. Design Agent
- **Purpose**: Creates high-level system designs and architecture
- **Capabilities**:
  - Translates user requirements into system specifications
  - Generates architecture diagrams and component relationships
  - Designs data models and API interfaces
  - Creates UI/UX wireframes and workflows
- **Collaboration**: Works closely with the Supervision Agent to ensure designs meet requirements

### 2. Coding Agent
- **Purpose**: Implements code based on system designs
- **Capabilities**:
  - Generates production-ready code across multiple languages
  - Implements frontend and backend components
  - Writes unit tests and documentation
  - Optimizes code for performance and readability
- **Collaboration**: Consumes outputs from the Design Agent and coordinates with Debug Agent

### 3. Debug Agent
- **Purpose**: Identifies and fixes issues in code
- **Capabilities**:
  - Performs code analysis to detect bugs and vulnerabilities
  - Diagnoses runtime errors and performance bottlenecks
  - Suggests and implements fixes for identified issues
  - Validates fixes through testing
- **Collaboration**: Works with the Coding Agent to improve code quality and with Self-Healing Agent for system-level issues

### 4. Supervision Agent
- **Purpose**: Manages the overall development process
- **Capabilities**:
  - Coordinates activities between agents
  - Tracks project progress and resource allocation
  - Ensures output quality meets requirements
  - Handles task prioritization and dependency management
- **Collaboration**: Oversees all agents and serves as the system orchestrator

### 5. Self-Healing Agent
- **Purpose**: Monitors system health and resolves issues autonomously
- **Capabilities**:
  - Continuously monitors system performance and logs
  - Detects, classifies, and analyzes errors
  - Recommends and implements fixes for system issues
  - Maintains system knowledge base for recurring problems
  - Learns from past errors to improve future prevention
- **Collaboration**: Works closely with the Debug Agent and provides feedback to all agents about system health

## Technical Implementation

### Agent Base Class
All agents inherit from a common `AgentBase` class that provides:
- Standard interface for agent operations
- Status tracking and activity logging
- Thread-based task execution
- Token usage monitoring
- Error handling with detailed metadata

### Self-Healing Capabilities
The Self-Healing Agent implements sophisticated error management:

1. **Error Detection**: Monitors logs, performance metrics, and system events
2. **Error Classification**: Categorizes issues into types:
   - Syntax Errors: Code syntax and parsing issues
   - Runtime Errors: Errors during execution
   - Logic Errors: Incorrect but valid code
   - Network Errors: Communication failures
   - Database Errors: Data storage and retrieval issues
   - Memory Errors: Resource allocation problems
   - Thread Errors: Concurrency and synchronization issues
   - API Errors: External service integration problems

3. **Error Analysis**: Performs root cause investigation using:
   - Stack trace examination
   - Pattern matching against known issues
   - Component relationship analysis
   - System knowledge database queries

4. **Solution Generation**: Creates fixes based on:
   - Historical solutions for similar problems
   - Component knowledge database
   - Error classification heuristics
   - LLM-powered code repair

5. **Fix Implementation**: Can apply solutions with:
   - Automatic code patching
   - Configuration adjustments
   - Dependency updates
   - Resource allocation changes

6. **Validation**: Verifies fixes with:
   - System health checks
   - Regression testing
   - Performance monitoring
   - Error reproduction attempts

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- API keys for supported LLM providers (Groq, Phidata)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Alvin-bytes/multiagent-programming-framework.git
cd multiagent-programming-framework
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Add your database URL and API keys:
```
DATABASE_URL=postgresql://username:password@localhost:5432/multiagent
GROQ_API_KEY=your_groq_api_key
PHIDATA_API_KEY=your_phidata_api_key
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## System Architecture

### Key Components

- **Server Layer**:
  - `server/index.ts`: Main server entry point
  - `server/routes.ts`: API routes for frontend interaction
  - `server/vite.ts`: Vite integration for development
  - `server/db.ts`: Database connection and configuration
  - `server/storage.ts`: Storage interface abstraction

- **Agent System**:
  - `server/agents/agentBase.ts`: Base agent implementation
  - `server/agents/designAgent.ts`: Design agent implementation
  - `server/agents/codingAgent.ts`: Coding agent implementation
  - `server/agents/debugAgent.ts`: Debug agent implementation
  - `server/agents/supervisionAgent.ts`: Supervision agent implementation
  - `server/agents/selfHealingAgent.ts`: Self-healing agent implementation

- **Services Layer**:
  - `server/services/llmService.ts`: LLM provider integration
  - `server/utils/threadManager.ts`: Thread management for tasks
  - `server/utils/logger.ts`: Logging system

- **Data Layer**:
  - `shared/schema.ts`: Database schema definitions
  - `server/databaseStorage.ts`: Database storage implementation
  - `drizzle.config.ts`: Database ORM configuration

- **Frontend Layer**:
  - `client/src/App.tsx`: Main React application
  - `client/src/components`: UI components
  - `client/src/hooks`: Custom React hooks
  - `client/src/pages`: Application pages

### Database Schema

The system uses a comprehensive database schema for persistent storage:
- **Agents**: Tracks agent configurations and status
- **Projects**: High-level organization of work
- **Tasks**: Individual work items within projects
- **Messages**: Communication between agents and users
- **System Activities**: Log of system events and actions
- **System Stats**: Metrics and performance statistics
- **Agent Memory**: Persistent agent knowledge storage
- **Project Components**: Tracking of system components
- **Component Relationships**: Relationships between components
- **System Knowledge**: Knowledge base for system understanding
- **System Error Logs**: Record of errors and their resolution

## Features

- **Specialized Agent System**: Delegates tasks to purpose-built agents for design, coding, debugging, supervision, and self-healing
- **Multi-Provider LLM Integration**: Seamlessly integrates with multiple LLM providers (Groq, Phidata)
- **Thread-Based Execution**: Manages concurrent execution and resource allocation to optimize task processing
- **Real-Time Monitoring**: Interactive dashboard to visualize system activity, agent states, and task progress
- **Persistent Memory**: Structured database storage for project components, agent memories, and system activity
- **Hierarchical Task Management**: Organizes development workflows into projects, tasks, and messages
- **WebSocket Communication**: Real-time updates and notifications through WebSocket connections
- **Self-Healing Capabilities**: Autonomous error detection, analysis, and resolution
- **Knowledge Management**: Centralized storage and retrieval of system knowledge
- **Error Classification**: Sophisticated error typing and root cause analysis
- **Metadata Enrichment**: Detailed metadata tracking for system activities and errors

## System Requirements

- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 500MB for application, database size varies with project complexity
- **Processor**: Multi-core processor recommended for concurrent agent execution
- **Network**: Stable internet connection for LLM API requests
- **Database**: PostgreSQL 13+ for persistent storage

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Node.js, Express, React, and PostgreSQL
- Powered by advanced language models from Groq and Phidata
- Inspired by multi-agent AI research and collaborative software development methodologies
