
# Multi-Agent Programming Framework

A sophisticated multi-agent framework designed to streamline complex software development tasks through intelligent, specialized agents. This system orchestrates a collaborative AI ecosystem for efficient and automated programming solutions.

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

## Key Components

- `server/index.ts`: Main server entry point
- `client/src`: React frontend code
- `shared/schema.ts`: Database schema definitions
- `server/agents`: AI agent implementations
- `server/services`: Core services
- `server/routes.ts`: API routes

## Features

- **Specialized Agent System**: Delegates tasks to purpose-built agents for design, coding, debugging, and supervision
- **Multi-Provider LLM Integration**: Seamlessly integrates with multiple LLM providers (Groq, Phidata)
- **Thread-Based Execution**: Manages concurrent execution and resource allocation to optimize task processing
- **Real-Time Monitoring**: Interactive dashboard to visualize system activity, agent states, and task progress
- **Persistent Memory**: Structured database storage for project components, agent memories, and system activity
- **Hierarchical Task Management**: Organizes development workflows into projects, tasks, and messages

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
