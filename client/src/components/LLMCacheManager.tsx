import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export enum LLMProvider {
  GROQ = 'groq',
  PHIDATA = 'phidata'
}

interface LLMCacheStats {
  size: number;
  hitRate: number;
}

interface LLMCacheSettings {
  ttlInSeconds: number;
  maxSize: number;
}

export const LLMCacheManager = () => {
  const [ttl, setTtl] = useState(300); // 5 minutes default
  const [maxSize, setMaxSize] = useState(100); // 100 entries default
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current cache stats
  const { data: cacheStats, isLoading: isLoadingStats } = useQuery<LLMCacheStats>({
    queryKey: ['/api/llm-cache-stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch current LLM provider
  const { data: providerData, isLoading: isLoadingProvider } = useQuery<{ provider: LLMProvider }>({
    queryKey: ['/api/llm-provider'],
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/llm-cache/clear', {
        method: 'POST'
      }),
    onSuccess: () => {
      toast({
        title: "Cache cleared",
        description: "LLM response cache has been cleared successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/llm-cache-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error clearing cache",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update cache settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: LLMCacheSettings) => 
      apiRequest('/api/llm-cache/settings', {
        method: 'POST',
        data: settings
      }),
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "LLM cache settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/llm-cache-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Set LLM provider mutation
  const setProviderMutation = useMutation({
    mutationFn: (provider: LLMProvider) => 
      apiRequest('/api/llm-provider', {
        method: 'POST',
        data: { provider }
      }),
    onSuccess: () => {
      toast({
        title: "Provider updated",
        description: "Default LLM provider has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/llm-provider'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating provider",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleClearCache = () => {
    clearCacheMutation.mutate();
  };
  
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({ ttlInSeconds: ttl, maxSize });
  };
  
  const handleChangeProvider = (provider: LLMProvider) => {
    setProviderMutation.mutate(provider);
  };
  
  // Format TTL as human-readable
  const formatTTL = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  };
  
  // Format hit rate as percentage
  const formatHitRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cache" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cache">Cache Settings</TabsTrigger>
          <TabsTrigger value="provider">LLM Provider</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LLM Cache Statistics</CardTitle>
              <CardDescription>
                Caching reduces API costs and improves response time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStats ? (
                <div className="space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cache Size</span>
                      <span className="font-medium">{cacheStats?.size || 0} / {maxSize} entries</span>
                    </div>
                    <Progress value={(cacheStats?.size || 0) / maxSize * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hit Rate</span>
                      <span className="font-medium">{formatHitRate(cacheStats?.hitRate || 0)}</span>
                    </div>
                    <Progress value={(cacheStats?.hitRate || 0) * 100} />
                  </div>
                </>
              )}
              
              <Button 
                variant="destructive" 
                onClick={handleClearCache}
                disabled={clearCacheMutation.isPending || (cacheStats?.size === 0)}
                className="w-full"
              >
                {clearCacheMutation.isPending ? "Clearing..." : "Clear Cache"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cache Configuration</CardTitle>
              <CardDescription>
                Adjust how long responses are cached and maximum cache size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="ttl">Time to Live (TTL)</Label>
                  <span className="text-sm text-muted-foreground">{formatTTL(ttl)}</span>
                </div>
                <Slider
                  id="ttl"
                  min={60}
                  max={86400}
                  step={60}
                  defaultValue={[300]}
                  value={[ttl]}
                  onValueChange={(values) => setTtl(values[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 minute</span>
                  <span>1 day</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="maxSize">Maximum Cache Size</Label>
                  <span className="text-sm text-muted-foreground">{maxSize} entries</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="maxSize"
                    type="number"
                    min={10}
                    max={10000}
                    value={maxSize}
                    onChange={(e) => setMaxSize(Math.max(10, Math.min(10000, parseInt(e.target.value) || 10)))}
                  />
                  <Slider
                    min={10}
                    max={1000}
                    step={10}
                    defaultValue={[100]}
                    value={[maxSize]}
                    onValueChange={(values) => setMaxSize(values[0])}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle>LLM Provider Selection</CardTitle>
              <CardDescription>
                Choose which LLM provider to use for agent operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProvider ? (
                <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              ) : (
                <Select 
                  value={providerData?.provider || LLMProvider.GROQ}
                  onValueChange={(value) => handleChangeProvider(value as LLMProvider)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select LLM Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LLMProvider.GROQ}>Groq (Llama-3.3-70b-versatile)</SelectItem>
                    <SelectItem value={LLMProvider.PHIDATA}>Phidata</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              <div className="rounded-lg border p-4">
                <div className="text-sm font-medium mb-2">Provider Information</div>
                <dl className="space-y-2 text-sm">
                  {providerData?.provider === LLMProvider.GROQ && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Model</dt>
                        <dd>Llama-3.3-70b-versatile</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Strengths</dt>
                        <dd>Fast inference, strong reasoning</dd>
                      </div>
                    </>
                  )}
                  
                  {providerData?.provider === LLMProvider.PHIDATA && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Alternative Provider</dt>
                        <dd>Phidata</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Strengths</dt>
                        <dd>Focused on agent operations</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};