import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AgentType } from "@/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APIKeys {
  groq: string;
  phidata: string;
}

interface SystemSettings {
  maxThreads: number;
  memoryLimit: number;
  tokenBudget: number;
}

interface AgentSettings {
  [AgentType.DESIGN]: boolean;
  [AgentType.CODING]: boolean;
  [AgentType.SUPERVISION]: boolean;
  [AgentType.DEBUG]: boolean;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // State for API keys (masked)
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    groq: import.meta.env.VITE_GROQ_API_KEY || "",
    phidata: import.meta.env.VITE_PHIDATA_API_KEY || "",
  });
  
  // State for editing API keys
  const [isEditingGroq, setIsEditingGroq] = useState(false);
  const [isEditingPhidata, setIsEditingPhidata] = useState(false);
  const [newGroqKey, setNewGroqKey] = useState("");
  const [newPhidataKey, setNewPhidataKey] = useState("");
  
  // System settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxThreads: 8,
    memoryLimit: 1024,
    tokenBudget: 2000,
  });
  
  // Agent settings
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    [AgentType.DESIGN]: true,
    [AgentType.CODING]: true,
    [AgentType.SUPERVISION]: true,
    [AgentType.DEBUG]: true,
  });
  
  const { toast } = useToast();
  
  // Handle input changes
  const handleSystemSettingChange = (setting: keyof SystemSettings, value: number) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleAgentSettingChange = (agent: AgentType, value: boolean) => {
    setAgentSettings(prev => ({
      ...prev,
      [agent]: value
    }));
  };
  
  // Handle API key updates
  const handleUpdateGroqKey = () => {
    if (newGroqKey) {
      setApiKeys(prev => ({ ...prev, groq: newGroqKey }));
      setNewGroqKey("");
      setIsEditingGroq(false);
      toast({
        title: "API Key Updated",
        description: "Groq API key has been updated successfully",
      });
    }
  };
  
  const handleUpdatePhidataKey = () => {
    if (newPhidataKey) {
      setApiKeys(prev => ({ ...prev, phidata: newPhidataKey }));
      setNewPhidataKey("");
      setIsEditingPhidata(false);
      toast({
        title: "API Key Updated",
        description: "Phidata API key has been updated successfully",
      });
    }
  };
  
  // Save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
    onClose();
  };
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditingGroq(false);
      setIsEditingPhidata(false);
      setNewGroqKey("");
      setNewPhidataKey("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">System Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* API Settings */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">API Configuration</h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-1">Groq API Key</Label>
                <div className="flex">
                  {isEditingGroq ? (
                    <Input
                      type="text"
                      value={newGroqKey}
                      onChange={(e) => setNewGroqKey(e.target.value)}
                      className="flex-1 rounded-r-none"
                      placeholder="Enter new API key"
                    />
                  ) : (
                    <Input
                      type="password"
                      value="********************************"
                      className="flex-1 rounded-r-none"
                      disabled
                    />
                  )}
                  <Button
                    variant={isEditingGroq ? "default" : "outline"}
                    className="rounded-l-none"
                    onClick={() => {
                      if (isEditingGroq) {
                        handleUpdateGroqKey();
                      } else {
                        setIsEditingGroq(true);
                      }
                    }}
                  >
                    {isEditingGroq ? "Save" : "Update"}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-1">Phidata/Agno API Key</Label>
                <div className="flex">
                  {isEditingPhidata ? (
                    <Input
                      type="text"
                      value={newPhidataKey}
                      onChange={(e) => setNewPhidataKey(e.target.value)}
                      className="flex-1 rounded-r-none"
                      placeholder="Enter new API key"
                    />
                  ) : (
                    <Input
                      type="password"
                      value="********************************"
                      className="flex-1 rounded-r-none"
                      disabled
                    />
                  )}
                  <Button
                    variant={isEditingPhidata ? "default" : "outline"}
                    className="rounded-l-none"
                    onClick={() => {
                      if (isEditingPhidata) {
                        handleUpdatePhidataKey();
                      } else {
                        setIsEditingPhidata(true);
                      }
                    }}
                  >
                    {isEditingPhidata ? "Save" : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* System Settings */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">System Settings</h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-1">Maximum Thread Count</Label>
                <Select
                  value={systemSettings.maxThreads.toString()}
                  onValueChange={(value) => handleSystemSettingChange("maxThreads", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select thread count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 threads</SelectItem>
                    <SelectItem value="8">8 threads</SelectItem>
                    <SelectItem value="16">16 threads</SelectItem>
                    <SelectItem value="32">32 threads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-1">Memory Limit</Label>
                <Select
                  value={systemSettings.memoryLimit.toString()}
                  onValueChange={(value) => handleSystemSettingChange("memoryLimit", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select memory limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512 MB</SelectItem>
                    <SelectItem value="1024">1 GB</SelectItem>
                    <SelectItem value="2048">2 GB</SelectItem>
                    <SelectItem value="4096">4 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-1">Token Budget Per Request</Label>
                <Input
                  type="number"
                  value={systemSettings.tokenBudget}
                  onChange={(e) => handleSystemSettingChange("tokenBudget", parseInt(e.target.value))}
                  min={100}
                  max={10000}
                />
              </div>
            </div>
          </div>
          
          {/* Agent Settings */}
          <div>
            <h4 className="text-md font-medium mb-3">Agent Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Design Agent</Label>
                <Switch
                  checked={agentSettings[AgentType.DESIGN]}
                  onCheckedChange={(checked) => handleAgentSettingChange(AgentType.DESIGN, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Coding Agent</Label>
                <Switch
                  checked={agentSettings[AgentType.CODING]}
                  onCheckedChange={(checked) => handleAgentSettingChange(AgentType.CODING, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Supervision Agent</Label>
                <Switch
                  checked={agentSettings[AgentType.SUPERVISION]}
                  onCheckedChange={(checked) => handleAgentSettingChange(AgentType.SUPERVISION, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Debug Agent</Label>
                <Switch
                  checked={agentSettings[AgentType.DEBUG]}
                  onCheckedChange={(checked) => handleAgentSettingChange(AgentType.DEBUG, checked)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
