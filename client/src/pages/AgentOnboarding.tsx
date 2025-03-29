import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, Brain, Code, Bug, Eye, Cog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgentContext } from "@/contexts/AgentContext";
import { AgentType, AgentStatus } from "@/types";

export default function AgentOnboarding() {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("design");
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [configuredAgents, setConfiguredAgents] = useState<string[]>([]);
  const [configurationData, setConfigurationData] = useState({
    design: {
      creativity: 70,
      speed: 50,
      detail: 60,
      preferences: ""
    },
    coding: {
      languages: ["JavaScript", "TypeScript", "Python"],
      paradigm: "functional",
      style: "clean",
      preferences: ""
    },
    debug: {
      thoroughness: 80,
      autoFix: true,
      preferences: ""
    },
    supervision: {
      autonomy: 60,
      communicationFrequency: "medium",
      preferences: ""
    },
    selfHealing: {
      proactiveness: 70,
      monitoring: "continuous",
      learningRate: 60,
      preferences: ""
    }
  });

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { agents, updateAgentStatus } = useAgentContext();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step - complete the onboarding
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfigureAgent = (agentType: string) => {
    if (!configuredAgents.includes(agentType)) {
      setConfiguredAgents([...configuredAgents, agentType]);
      
      toast({
        title: "Agent Configured",
        description: `The ${agentType} agent has been successfully configured.`,
        variant: "default"
      });
    }
  };

  const handleApiKeySetup = () => {
    setApiKeyConfigured(true);
    
    toast({
      title: "API Keys Configured",
      description: "Your LLM provider API keys have been successfully configured.",
      variant: "default"
    });
  };

  const completeOnboarding = async () => {
    // Activate all agents
    for (const agent of agents) {
      if (agent.status !== AgentStatus.ACTIVE) {
        await updateAgentStatus(agent.id, AgentStatus.ACTIVE);
      }
    }
    
    toast({
      title: "Onboarding Complete",
      description: "Your intelligent agent system has been configured and activated.",
      variant: "default"
    });
    
    // Navigate to dashboard
    setLocation("/");
  };

  const updateAgentConfig = (agent: string, field: string, value: any) => {
    setConfigurationData({
      ...configurationData,
      [agent]: {
        ...configurationData[agent as keyof typeof configurationData],
        [field]: value
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Intelligent Agent Onboarding</CardTitle>
          <CardDescription className="text-center">
            Configure your AI agent team to match your preferences and workflow
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Welcome to the Multi-Agent Programming Framework</h3>
              <p className="text-muted-foreground">
                This wizard will help you set up and customize your intelligent agent team.
                Each agent can be configured to match your specific preferences and workflow.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                      <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">Specialized Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Configure five specialized agents for design, coding, debugging, supervision, and self-healing
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                      <Cog className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">Customizable Behavior</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Adjust intelligence parameters, processing styles, and communication preferences
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-2">
                      <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg">Advanced Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Set up visualization tools and monitoring systems for agent decision processes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">LLM Provider Configuration</h3>
              <p className="text-muted-foreground">
                Configure your LLM provider API keys to power the intelligent agents.
                You can use multiple providers for different agents or tasks.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="groq-api-key">Groq API Key</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="groq-api-key" 
                      type="password" 
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" 
                      className="flex-1"
                      disabled={apiKeyConfigured}
                    />
                    {apiKeyConfigured && (
                      <Button variant="outline" size="icon" className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phidata-api-key">Phidata API Key</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="phidata-api-key" 
                      type="password" 
                      placeholder="phi-xxxxxxxxxxxxxxxxxxxxxxxx" 
                      className="flex-1"
                      disabled={apiKeyConfigured}
                    />
                    {apiKeyConfigured && (
                      <Button variant="outline" size="icon" className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleApiKeySetup} 
                  disabled={apiKeyConfigured}
                  className="mt-4"
                >
                  {apiKeyConfigured ? "API Keys Configured" : "Configure API Keys"}
                </Button>
                
                {apiKeyConfigured && (
                  <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800 mt-4">
                    <CardContent className="p-4 flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-300">API Keys Successfully Configured</h4>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Your LLM provider API keys have been verified and configured successfully.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Agent Configuration</h3>
              <p className="text-muted-foreground">
                Customize each agent's behavior, capabilities, and preferences to match your needs.
              </p>
              
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="design" className="flex flex-col items-center py-2">
                    <Brain className="w-5 h-5 mb-1" />
                    <span>Design</span>
                  </TabsTrigger>
                  <TabsTrigger value="coding" className="flex flex-col items-center py-2">
                    <Code className="w-5 h-5 mb-1" />
                    <span>Coding</span>
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="flex flex-col items-center py-2">
                    <Bug className="w-5 h-5 mb-1" />
                    <span>Debug</span>
                  </TabsTrigger>
                  <TabsTrigger value="supervision" className="flex flex-col items-center py-2">
                    <Eye className="w-5 h-5 mb-1" />
                    <span>Supervision</span>
                  </TabsTrigger>
                  <TabsTrigger value="selfHealing" className="flex flex-col items-center py-2">
                    <Cog className="w-5 h-5 mb-1" />
                    <span>Self-Healing</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="design" className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg">Design Agent Configuration</h4>
                  <p className="text-muted-foreground">
                    The Design Agent translates requirements into system designs and architecture.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Creativity Level</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.design.creativity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.design.creativity} 
                        onChange={(e) => updateAgentConfig("design", "creativity", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Practical</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Processing Speed</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.design.speed}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.design.speed} 
                        onChange={(e) => updateAgentConfig("design", "speed", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Thorough</span>
                        <span>Rapid</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Detail Level</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.design.detail}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.design.detail} 
                        onChange={(e) => updateAgentConfig("design", "detail", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>High-level</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="design-preferences">Additional Preferences</Label>
                      <Textarea 
                        id="design-preferences" 
                        placeholder="Enter any specific design preferences or guidelines..."
                        value={configurationData.design.preferences}
                        onChange={(e) => updateAgentConfig("design", "preferences", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => handleConfigureAgent("design")}
                      disabled={configuredAgents.includes("design")}
                      className="mt-2"
                    >
                      {configuredAgents.includes("design") ? "Design Agent Configured" : "Configure Design Agent"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="coding" className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg">Coding Agent Configuration</h4>
                  <p className="text-muted-foreground">
                    The Coding Agent generates production-ready code based on designs and specifications.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label>Preferred Programming Paradigm</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={configurationData.coding.paradigm === "functional" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "paradigm", "functional")}
                          className="w-full"
                        >
                          Functional
                        </Button>
                        <Button 
                          variant={configurationData.coding.paradigm === "object-oriented" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "paradigm", "object-oriented")}
                          className="w-full"
                        >
                          Object-Oriented
                        </Button>
                        <Button 
                          variant={configurationData.coding.paradigm === "procedural" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "paradigm", "procedural")}
                          className="w-full"
                        >
                          Procedural
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Code Style Preference</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={configurationData.coding.style === "clean" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "style", "clean")}
                          className="w-full"
                        >
                          Clean & Readable
                        </Button>
                        <Button 
                          variant={configurationData.coding.style === "optimized" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "style", "optimized")}
                          className="w-full"
                        >
                          Performance Optimized
                        </Button>
                        <Button 
                          variant={configurationData.coding.style === "concise" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("coding", "style", "concise")}
                          className="w-full"
                        >
                          Concise
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coding-preferences">Additional Preferences</Label>
                      <Textarea 
                        id="coding-preferences" 
                        placeholder="Enter any specific coding preferences or guidelines..."
                        value={configurationData.coding.preferences}
                        onChange={(e) => updateAgentConfig("coding", "preferences", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => handleConfigureAgent("coding")}
                      disabled={configuredAgents.includes("coding")}
                      className="mt-2"
                    >
                      {configuredAgents.includes("coding") ? "Coding Agent Configured" : "Configure Coding Agent"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="debug" className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg">Debug Agent Configuration</h4>
                  <p className="text-muted-foreground">
                    The Debug Agent identifies and fixes issues in code, improving quality and reliability.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Thoroughness Level</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.debug.thoroughness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.debug.thoroughness} 
                        onChange={(e) => updateAgentConfig("debug", "thoroughness", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Quick Scan</span>
                        <span>Deep Analysis</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-fix"
                        checked={configurationData.debug.autoFix}
                        onChange={(e) => updateAgentConfig("debug", "autoFix", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="auto-fix">Enable automatic issue fixing when possible</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="debug-preferences">Additional Preferences</Label>
                      <Textarea 
                        id="debug-preferences" 
                        placeholder="Enter any specific debugging preferences or guidelines..."
                        value={configurationData.debug.preferences}
                        onChange={(e) => updateAgentConfig("debug", "preferences", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => handleConfigureAgent("debug")}
                      disabled={configuredAgents.includes("debug")}
                      className="mt-2"
                    >
                      {configuredAgents.includes("debug") ? "Debug Agent Configured" : "Configure Debug Agent"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="supervision" className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg">Supervision Agent Configuration</h4>
                  <p className="text-muted-foreground">
                    The Supervision Agent coordinates activities between agents and manages the overall process.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Autonomy Level</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.supervision.autonomy}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.supervision.autonomy} 
                        onChange={(e) => updateAgentConfig("supervision", "autonomy", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Human Guided</span>
                        <span>Fully Autonomous</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Communication Frequency</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={configurationData.supervision.communicationFrequency === "low" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("supervision", "communicationFrequency", "low")}
                          className="w-full"
                        >
                          Low
                        </Button>
                        <Button 
                          variant={configurationData.supervision.communicationFrequency === "medium" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("supervision", "communicationFrequency", "medium")}
                          className="w-full"
                        >
                          Medium
                        </Button>
                        <Button 
                          variant={configurationData.supervision.communicationFrequency === "high" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("supervision", "communicationFrequency", "high")}
                          className="w-full"
                        >
                          High
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supervision-preferences">Additional Preferences</Label>
                      <Textarea 
                        id="supervision-preferences" 
                        placeholder="Enter any specific supervision preferences or guidelines..."
                        value={configurationData.supervision.preferences}
                        onChange={(e) => updateAgentConfig("supervision", "preferences", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => handleConfigureAgent("supervision")}
                      disabled={configuredAgents.includes("supervision")}
                      className="mt-2"
                    >
                      {configuredAgents.includes("supervision") ? "Supervision Agent Configured" : "Configure Supervision Agent"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="selfHealing" className="space-y-4 mt-4">
                  <h4 className="font-medium text-lg">Self-Healing Agent Configuration</h4>
                  <p className="text-muted-foreground">
                    The Self-Healing Agent monitors system health and autonomously resolves issues.
                  </p>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Proactiveness Level</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.selfHealing.proactiveness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.selfHealing.proactiveness} 
                        onChange={(e) => updateAgentConfig("selfHealing", "proactiveness", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Reactive</span>
                        <span>Proactive</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Monitoring Mode</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={configurationData.selfHealing.monitoring === "periodic" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("selfHealing", "monitoring", "periodic")}
                          className="w-full"
                        >
                          Periodic
                        </Button>
                        <Button 
                          variant={configurationData.selfHealing.monitoring === "event-based" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("selfHealing", "monitoring", "event-based")}
                          className="w-full"
                        >
                          Event-Based
                        </Button>
                        <Button 
                          variant={configurationData.selfHealing.monitoring === "continuous" ? "default" : "outline"}
                          onClick={() => updateAgentConfig("selfHealing", "monitoring", "continuous")}
                          className="w-full"
                        >
                          Continuous
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Learning Rate</Label>
                        <span className="text-sm text-muted-foreground">{configurationData.selfHealing.learningRate}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={configurationData.selfHealing.learningRate} 
                        onChange={(e) => updateAgentConfig("selfHealing", "learningRate", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conservative</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="self-healing-preferences">Additional Preferences</Label>
                      <Textarea 
                        id="self-healing-preferences" 
                        placeholder="Enter any specific self-healing preferences or guidelines..."
                        value={configurationData.selfHealing.preferences}
                        onChange={(e) => updateAgentConfig("selfHealing", "preferences", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      onClick={() => handleConfigureAgent("selfHealing")}
                      disabled={configuredAgents.includes("selfHealing")}
                      className="mt-2"
                    >
                      {configuredAgents.includes("selfHealing") ? "Self-Healing Agent Configured" : "Configure Self-Healing Agent"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Agent Intelligence Visualization Setup</h3>
              <p className="text-muted-foreground">
                Configure visualization tools to monitor and understand agent decision-making processes.
                These visualizations will help you track agent activities and understand their reasoning.
              </p>
              
              <div className="space-y-6 mt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Decision Flow Visualization</h4>
                    <p className="text-sm text-muted-foreground">
                      Visual representation of agent decision processes with branching paths and confidence scores
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Real-time Agent Activity Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      Live dashboard showing current agent tasks, status, and performance metrics
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Error Detection and Remediation Visuals</h4>
                    <p className="text-sm text-muted-foreground">
                      Tracking of error patterns, root cause analysis, and self-healing actions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Agent Collaboration Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Network graph showing interactions and information flow between agents
                    </p>
                  </div>
                </div>
                
                <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border border-slate-200 dark:border-slate-700 mt-6">
                  <CardContent className="p-6">
                    <h4 className="font-medium text-lg">All Visualization Tools Enabled</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your agent intelligence visualization dashboard is ready to use. You'll be able to monitor agent
                      decisions, track system health, and understand the collaborative workflow of your AI team.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          
          <Button onClick={handleContinue}>
            {step < totalSteps ? (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}