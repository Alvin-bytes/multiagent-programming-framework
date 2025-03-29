import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Agent, AgentType } from "@/types";
import { useAgentContext } from "@/contexts/AgentContext";
import { Brain, Code, Bug, Eye, Cog, BarChart4, Network, GitBranch, AlertCircle } from "lucide-react";

// Decision node type for visualization
interface DecisionNode {
  id: string;
  label: string;
  description: string;
  confidence: number;
  type: 'decision' | 'action' | 'evaluation' | 'error';
  children: DecisionNode[];
  metadata?: Record<string, any>;
}

// Sample decision trees for each agent type
const sampleDecisionTrees: Record<AgentType, DecisionNode> = {
  [AgentType.DESIGN]: {
    id: 'd1',
    label: 'Analyze Requirements',
    description: 'Extracting key requirements from user input',
    confidence: 0.95,
    type: 'decision',
    children: [
      {
        id: 'd2',
        label: 'System Architecture Selection',
        description: 'Determining optimal architecture pattern',
        confidence: 0.85,
        type: 'decision',
        children: [
          {
            id: 'd3',
            label: 'Microservices Architecture',
            description: 'Selected for scalability and flexibility',
            confidence: 0.72,
            type: 'action',
            children: []
          },
          {
            id: 'd4',
            label: 'Monolithic Architecture',
            description: 'Rejected due to scalability concerns',
            confidence: 0.28,
            type: 'action',
            children: []
          }
        ]
      },
      {
        id: 'd5',
        label: 'Component Design',
        description: 'Designing key system components',
        confidence: 0.92,
        type: 'action',
        children: []
      }
    ]
  },
  [AgentType.CODING]: {
    id: 'c1',
    label: 'Parse Design Specs',
    description: 'Interpreting design specifications',
    confidence: 0.93,
    type: 'decision',
    children: [
      {
        id: 'c2',
        label: 'Technology Selection',
        description: 'Choosing appropriate technologies',
        confidence: 0.88,
        type: 'decision',
        children: [
          {
            id: 'c3',
            label: 'Framework Selection',
            description: 'Selecting optimal framework',
            confidence: 0.90,
            type: 'decision',
            children: [
              {
                id: 'c4',
                label: 'Node.js + Express',
                description: 'Selected for performance and ecosystem',
                confidence: 0.85,
                type: 'action',
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'c5',
        label: 'Code Structure Planning',
        description: 'Planning modular code organization',
        confidence: 0.95,
        type: 'action',
        children: []
      }
    ]
  },
  [AgentType.DEBUG]: {
    id: 'b1',
    label: 'Code Analysis',
    description: 'Scanning code for potential issues',
    confidence: 0.97,
    type: 'decision',
    children: [
      {
        id: 'b2',
        label: 'Issue Detection',
        description: 'Memory leak detected in user authentication',
        confidence: 0.89,
        type: 'evaluation',
        children: [
          {
            id: 'b3',
            label: 'Root Cause Analysis',
            description: 'Unclosed database connection',
            confidence: 0.92,
            type: 'evaluation',
            children: [
              {
                id: 'b4',
                label: 'Fix Implementation',
                description: 'Added proper connection closure',
                confidence: 0.95,
                type: 'action',
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'b5',
        label: 'Performance Bottleneck',
        description: 'Detected inefficient database query',
        confidence: 0.78,
        type: 'error',
        children: []
      }
    ]
  },
  [AgentType.SUPERVISION]: {
    id: 's1',
    label: 'Task Coordination',
    description: 'Coordinating agent activities',
    confidence: 0.96,
    type: 'decision',
    children: [
      {
        id: 's2',
        label: 'Priority Assessment',
        description: 'Evaluating task priorities',
        confidence: 0.92,
        type: 'decision',
        children: [
          {
            id: 's3',
            label: 'High Priority Task',
            description: 'Database implementation',
            confidence: 0.88,
            type: 'action',
            children: []
          },
          {
            id: 's4',
            label: 'Medium Priority Task',
            description: 'Frontend styling',
            confidence: 0.65,
            type: 'action',
            children: []
          }
        ]
      },
      {
        id: 's5',
        label: 'Resource Allocation',
        description: 'Allocating agent resources',
        confidence: 0.94,
        type: 'action',
        children: []
      }
    ]
  },
  [AgentType.SELF_HEALING]: {
    id: 'sh1',
    label: 'System Monitoring',
    description: 'Monitoring system health',
    confidence: 0.98,
    type: 'decision',
    children: [
      {
        id: 'sh2',
        label: 'Error Detection',
        description: 'Database connection failure detected',
        confidence: 0.95,
        type: 'evaluation',
        children: [
          {
            id: 'sh3',
            label: 'Error Classification',
            description: 'Classified as connection timeout',
            confidence: 0.92,
            type: 'evaluation',
            children: [
              {
                id: 'sh4',
                label: 'Fix Implementation',
                description: 'Added connection retry logic',
                confidence: 0.88,
                type: 'action',
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'sh5',
        label: 'Performance Degradation',
        description: 'Slow query response times',
        confidence: 0.82,
        type: 'error',
        children: []
      }
    ]
  }
};

// Generate a simulated recent log entry
const generateLogEntry = (agent: Agent) => {
  const actions = [
    "processed user request",
    "analyzed system requirements",
    "generated code solution",
    "resolved code issue",
    "coordinated agent activities",
    "detected and fixed system error",
    "optimized database queries",
    "improved frontend components",
    "validated system design",
    "restructured code architecture"
  ];
  
  const timestamps = [
    "2 mins ago",
    "5 mins ago",
    "12 mins ago",
    "18 mins ago",
    "25 mins ago",
    "37 mins ago",
    "48 mins ago",
    "1 hour ago"
  ];
  
  return {
    action: actions[Math.floor(Math.random() * actions.length)],
    timestamp: timestamps[Math.floor(Math.random() * timestamps.length)],
    confidence: Math.round(70 + Math.random() * 29)
  };
};

// Component to render a decision node
const DecisionNodeComponent: React.FC<{ 
  node: DecisionNode, 
  level: number, 
  expanded: boolean, 
  toggleExpand: () => void
}> = ({ node, level, expanded, toggleExpand }) => {
  const getNodeColor = () => {
    switch (node.type) {
      case 'decision': return 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
      case 'action': return 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
      case 'evaluation': return 'bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800';
      case 'error': return 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };
  
  const getNodeIcon = () => {
    switch (node.type) {
      case 'decision': return <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'action': return <Cog className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'evaluation': return <BarChart4 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default: return null;
    }
  };
  
  return (
    <div className="ml-4">
      <div 
        className={`p-3 rounded-md border ${getNodeColor()} mb-2 cursor-pointer`}
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              {getNodeIcon()}
            </div>
            <div>
              <div className="font-medium">{node.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{node.description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800">
              {Math.round(node.confidence * 100)}% confidence
            </div>
            {node.children.length > 0 && (
              <div className="text-xs bg-gray-100 dark:bg-gray-800 w-5 h-5 rounded-full flex items-center justify-center">
                {expanded ? '-' : '+'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {expanded && node.children.length > 0 && (
        <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-2">
          {node.children.map(child => (
            <ExpandableNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// Expandable node component with state
const ExpandableNode: React.FC<{ node: DecisionNode, level: number }> = ({ node, level }) => {
  const [expanded, setExpanded] = useState(level < 2);
  
  return (
    <DecisionNodeComponent 
      node={node} 
      level={level} 
      expanded={expanded} 
      toggleExpand={() => setExpanded(!expanded)} 
    />
  );
};

// Agent icon component
const AgentIcon: React.FC<{ agentType: string | AgentType }> = ({ agentType }) => {
  const iconProps = { className: "w-5 h-5" };
  
  // Convert string to enum if needed
  const type = typeof agentType === 'string' ? agentType as AgentType : agentType;
  
  switch (type) {
    case AgentType.DESIGN:
      return <Brain {...iconProps} />;
    case AgentType.CODING:
      return <Code {...iconProps} />;
    case AgentType.DEBUG:
      return <Bug {...iconProps} />;
    case AgentType.SUPERVISION:
      return <Eye {...iconProps} />;
    case AgentType.SELF_HEALING:
      return <Cog {...iconProps} />;
    default:
      return null;
  }
};

// Main component
const AgentDecisionVisualization: React.FC = () => {
  const { agents } = useAgentContext();
  const [activeView, setActiveView] = useState<'tree' | 'timeline' | 'network'>('tree');
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.SELF_HEALING);
  const networkRef = useRef<HTMLDivElement>(null);
  
  // Generate simulated log entries for each agent
  const [logs] = useState(() => 
    agents.map(agent => ({
      agent,
      entries: Array(5).fill(0).map(() => generateLogEntry(agent))
    }))
  );
  
  // Simulate network visualization
  useEffect(() => {
    if (activeView === 'network' && networkRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = networkRef.current.clientWidth;
      canvas.height = 300;
      networkRef.current.innerHTML = '';
      networkRef.current.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Define node positions
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      const nodeRadius = 20;
      
      // Agent positions in a circle
      const positions = [
        { x: centerX, y: centerY - radius }, // top
        { x: centerX + radius, y: centerY }, // right
        { x: centerX, y: centerY + radius }, // bottom
        { x: centerX - radius, y: centerY }, // left
        { x: centerX, y: centerY }, // center
      ];
      
      // Agent colors
      const colors = {
        [AgentType.DESIGN]: '#3b82f6',
        [AgentType.CODING]: '#10b981',
        [AgentType.DEBUG]: '#f59e0b',
        [AgentType.SUPERVISION]: '#8b5cf6',
        [AgentType.SELF_HEALING]: '#ef4444',
      };
      
      // Draw connections
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.lineWidth = 2;
      
      // Connect all agents to supervision (center)
      const centerPos = positions[4];
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(centerPos.x, centerPos.y);
        ctx.lineTo(positions[i].x, positions[i].y);
        ctx.stroke();
      }
      
      // Draw highlight for active connection
      const activeAgentIndex = Object.values(AgentType).indexOf(activeAgent);
      if (activeAgentIndex >= 0 && activeAgentIndex < 4) {
        ctx.strokeStyle = colors[activeAgent];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerPos.x, centerPos.y);
        ctx.lineTo(positions[activeAgentIndex].x, positions[activeAgentIndex].y);
        ctx.stroke();
        
        // Draw animated dots
        const animateDots = () => {
          // Clear previous dots
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Redraw all connections
          ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(centerPos.x, centerPos.y);
            ctx.lineTo(positions[i].x, positions[i].y);
            ctx.stroke();
          }
          
          // Redraw active connection
          ctx.strokeStyle = colors[activeAgent];
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(centerPos.x, centerPos.y);
          ctx.lineTo(positions[activeAgentIndex].x, positions[activeAgentIndex].y);
          ctx.stroke();
          
          // Draw animated dots on the active connection
          const now = Date.now() / 1000;
          const dx = positions[activeAgentIndex].x - centerPos.x;
          const dy = positions[activeAgentIndex].y - centerPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Draw multiple dots
          for (let i = 0; i < 3; i++) {
            const progress = (now * 0.5 + i * 0.33) % 1;
            const dotX = centerPos.x + dx * progress;
            const dotY = centerPos.y + dy * progress;
            
            ctx.fillStyle = colors[activeAgent];
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          
          requestAnimationFrame(animateDots);
        };
        
        animateDots();
      }
      
      // Draw nodes
      const agentTypes = Object.values(AgentType);
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const agentType = agentTypes[i];
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = i === 4 ? '#8b5cf6' : colors[agentType];
        ctx.fill();
        
        // Draw highlight for active agent
        if (agentType === activeAgent || (i === 4 && activeAgent === AgentType.SUPERVISION)) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeRadius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Draw agent icon (would need images for real implementation)
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = i === 4 ? 'SUP' : agentType.substring(0, 3).toUpperCase();
        ctx.fillText(label, pos.x, pos.y);
      }
    }
  }, [activeView, activeAgent, agents]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Agent Intelligence Visualization</CardTitle>
        <CardDescription>
          Monitor agent decision-making processes and collaborative intelligence
        </CardDescription>
        
        <div className="flex justify-end mt-4">          
          <div className="flex space-x-1">
            {agents.map(agent => (
              <Button
                key={agent.id}
                variant={activeAgent === agent.type ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveAgent(agent.type as AgentType)}
                className="flex items-center"
              >
                <AgentIcon agentType={agent.type} />
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeView} 
          onValueChange={(value) => setActiveView(value as 'tree' | 'timeline' | 'network')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tree">Decision Tree</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="network">Agent Network</TabsTrigger>
          </TabsList>
          
          {/* Decision Tree View */}
          <TabsContent value="tree">
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="font-medium mb-4 flex items-center space-x-2">
                <AgentIcon agentType={activeAgent} />
                <span>{activeAgent} Agent Decision Process</span>
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="pr-4">
                  <ExpandableNode 
                    node={sampleDecisionTrees[activeAgent]} 
                    level={0} 
                  />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Timeline View */}
          <TabsContent value="timeline">
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="font-medium mb-4 flex items-center space-x-2">
                <AgentIcon agentType={activeAgent} />
                <span>{activeAgent} Agent Activity Timeline</span>
              </div>
              
              <ScrollArea className="h-[350px]">
                <div className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-4 pr-4">
                  {logs.find(log => log.agent.type === activeAgent)?.entries.map((entry, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[32px] w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${entry.confidence > 85 ? 'bg-green-500' : entry.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div className="mb-1 flex justify-between">
                        <div className="font-medium">{entry.action}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{entry.timestamp}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          Confidence: {entry.confidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Network View */}
          <TabsContent value="network">
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="font-medium mb-4">Agent Collaboration Network</div>
              
              <ScrollArea className="h-[350px]">
                <div 
                  ref={networkRef} 
                  className="h-[300px] w-full flex items-center justify-center"
                >
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Loading network visualization...
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 px-4 pb-2">
                  The network visualization shows real-time collaboration between agents, with the
                  Supervision Agent (center) coordinating activities between specialized agents.
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentDecisionVisualization;