# Multi-Agent Programming Framework

A sophisticated multi-agent framework designed to streamline complex software development tasks through intelligent, specialized agents. This system orchestrates a collaborative AI ecosystem for efficient and automated programming solutions.

## Key Features

- **Specialized Agent System**: Delegates tasks to purpose-built agents for design, coding, debugging, and supervision
- **Multi-Provider LLM Integration**: Seamlessly integrates with multiple LLM providers (Groq, Phidata)
- **Thread-Based Execution**: Manages concurrent execution and resource allocation to optimize task processing
- **Real-Time Monitoring**: Interactive dashboard to visualize system activity, agent states, and task progress
- **Persistent Memory**: Structured database storage for project components, agent memories, and system activity
- **Hierarchical Task Management**: Organizes development workflows into projects, tasks, and messages

## Architecture

The system is built on a modular architecture with the following components:

- **Agent Layer**: Specialized agents with distinct capabilities and responsibilities
- **Thread Management**: Dynamic worker allocation for concurrent task execution
- **Memory System**: Short-term and long-term memory capabilities for agents
- **Component Registry**: Tracks project components and their relationships
- **API Integration**: Standardized interface for multiple LLM providers
- **Dashboard UI**: Real-time visualization and control interface

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- API keys for supported LLM providers (Groq, Phidata)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Alvin-bytes/multiagent-programming-framework.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your API keys:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/multiagent
   GROQ_API_KEY=your_groq_api_key
   PHIDATA_API_KEY=your_phidata_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Agent Types

- **Design Agent**: Plans and structures software architecture
- **Coding Agent**: Implements code based on specifications
- **Debug Agent**: Identifies and resolves issues in code
- **Supervision Agent**: Coordinates other agents and manages workflows

## System Requirements

- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 500MB for application, database size varies with project complexity
- **Processor**: Multi-core processor recommended for concurrent agent execution
- **Network**: Stable internet connection for LLM API requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Node.js, Express, React, and PostgreSQL
- Powered by advanced language models from Groq and Phidata
- Inspired by multi-agent AI research and collaborative software development methodologies