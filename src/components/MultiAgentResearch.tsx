import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Send, 
  Users, 
  Brain, 
  CheckCircle, 
  Clock, 
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { MultiAgentQuery, AgentResponse } from '@/lib/api-keys';
import { toast } from '@/hooks/use-toast';

const querySchema = z.object({
  query: z.string().min(10, 'Query must be at least 10 characters long'),
});

type QueryFormData = z.infer<typeof querySchema>;

export const MultiAgentResearch = () => {
  const { 
    apiKeys, 
    queries, 
    createMultiAgentQuery, 
    updateQueryStatus,
    decryptAPIKey 
  } = useAPIKeys();
  
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<MultiAgentQuery | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const form = useForm<QueryFormData>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: '',
    },
  });

  const activeAgents = apiKeys.filter(key => key.isActive);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSubmit = async (data: QueryFormData) => {
    if (selectedAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "No Agents Selected",
        description: "Please select at least one AI agent to execute your query.",
      });
      return;
    }

    if (!password) {
      setShowPasswordInput(true);
      return;
    }

    // Validate password for all selected agents
    const validAgents = [];
    for (const agentId of selectedAgents) {
      const decryptedKey = await decryptAPIKey(agentId, password);
      if (decryptedKey) {
        validAgents.push(agentId);
      }
    }

    if (validAgents.length === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "The password you entered is incorrect for all selected agents.",
      });
      return;
    }

    if (validAgents.length < selectedAgents.length) {
      toast({
        title: "Partial Success",
        description: `Only ${validAgents.length} out of ${selectedAgents.length} agents will be used due to invalid passwords.`,
      });
    }

    // Create and execute the query
    const query = createMultiAgentQuery(data.query, validAgents);
    setCurrentQuery(query);
    setPassword('');
    setShowPasswordInput(false);
    
    await executeMultiAgentQuery(query, validAgents, password);
  };

  const executeMultiAgentQuery = async (
    query: MultiAgentQuery, 
    agentIds: string[], 
    password: string
  ) => {
    setIsExecuting(true);
    updateQueryStatus(query.id, 'processing');

    try {
      const results: Record<string, AgentResponse> = {};
      const totalAgents = agentIds.length;
      let completedAgents = 0;

      // Execute queries in parallel for all agents
      const agentPromises = agentIds.map(async (agentId) => {
        try {
          const agent = apiKeys.find(k => k.id === agentId);
          if (!agent) return;

          const decryptedKey = await decryptAPIKey(agentId, password);
          if (!decryptedKey) return;

          const startTime = Date.now();
          
          // Simulate API call (replace with actual API calls)
          const response = await simulateAPICall(agent, decryptedKey, query.query);
          
          const endTime = Date.now();
          const latency = endTime - startTime;

          const agentResponse: AgentResponse = {
            agentId,
            agentName: agent.name,
            response: response,
            model: agent.metadata?.model || 'unknown',
            tokensUsed: Math.floor(Math.random() * 1000) + 100, // Simulated
            latency,
            timestamp: new Date().toISOString()
          };

          results[agentId] = agentResponse;
          completedAgents++;
          
          // Update progress
          updateQueryStatus(query.id, 'processing', results);
          
        } catch (error) {
          console.error(`Agent ${agentId} failed:`, error);
          completedAgents++;
        }
      });

      await Promise.all(agentPromises);
      
      // Mark query as completed
      updateQueryStatus(query.id, 'completed', results);
      
      toast({
        title: "Research Complete!",
        description: `Successfully executed query across ${completedAgents} AI agents.`,
      });

    } catch (error) {
      console.error('Multi-agent query failed:', error);
      updateQueryStatus(query.id, 'failed');
      
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: "There was an error executing your multi-agent research query.",
      });
    } finally {
      setIsExecuting(false);
      setCurrentQuery(null);
    }
  };

  // Simulate API call (replace with actual API implementations)
  const simulateAPICall = async (agent: any, apiKey: string, query: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate different responses based on provider
    const responses = {
      openai: `Based on my analysis of "${query}", I've identified several key market opportunities. The current landscape shows significant gaps in [specific area], with potential for disruption through [specific approach]. Key insights include [insight 1], [insight 2], and [insight 3].`,
      anthropic: `From my research perspective on "${query}", I can see emerging patterns that suggest [trend 1] and [trend 2]. The market appears to be shifting toward [direction], creating opportunities in [specific sectors].`,
      google: `My analysis of "${query}" reveals several interesting market dynamics. The data suggests [finding 1], with particular emphasis on [finding 2]. This creates potential for [opportunity type] in the near term.`,
      custom: `Based on my custom analysis of "${query}", I've identified unique market insights. The current environment presents [specific opportunity] with [specific challenges] that could be addressed through [specific solution].`
    };

    return responses[agent.provider] || responses.custom;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Multi-Agent Research</h2>
        <p className="text-muted-foreground text-lg">
          Execute research queries across multiple AI agents simultaneously
        </p>
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select AI Agents
          </CardTitle>
          <CardDescription>
            Choose which AI agents to include in your research query
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAgents.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Agents</h3>
              <p className="text-muted-foreground mb-4">
                You need to add and activate API keys to use multi-agent research
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAgents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAgents.includes(agent.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAgentToggle(agent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {agent.provider === 'openai' && '🤖'}
                        {agent.provider === 'anthropic' && '🧠'}
                        {agent.provider === 'google' && '🔍'}
                        {agent.provider === 'custom' && '⚙️'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {agent.provider.charAt(0).toUpperCase() + agent.provider.slice(1)}
                          {agent.metadata?.model && ` • ${agent.metadata.model}`}
                        </p>
                      </div>
                      {selectedAgents.includes(agent.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Research Query
          </CardTitle>
          <CardDescription>
            Enter your research question to be analyzed by all selected agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Research Question</Label>
              <Input
                id="query"
                placeholder="e.g., What are the emerging opportunities in sustainable transportation for urban areas?"
                className="text-lg"
                {...form.register('query')}
              />
              {form.formState.errors.query && (
                <p className="text-sm text-red-600">{form.formState.errors.query.message}</p>
              )}
            </div>

            {showPasswordInput && (
              <div className="space-y-2">
                <Label htmlFor="password">Encryption Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your encryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This password is needed to decrypt your API keys for the query
                </p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={isExecuting || selectedAgents.length === 0}
                className="flex-1"
              >
                {isExecuting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Execute Research
                  </>
                )}
              </Button>
              
              {isExecuting && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsExecuting(false);
                    setCurrentQuery(null);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Progress and Results */}
      {currentQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Research Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Query Status</span>
                <Badge className={getStatusColor(currentQuery.status)}>
                  {getStatusIcon(currentQuery.status)}
                  <span className="ml-2 capitalize">{currentQuery.status}</span>
                </Badge>
              </div>
              
              {currentQuery.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Object.keys(currentQuery.results).length} / {currentQuery.selectedAgents.length} agents</span>
                  </div>
                  <Progress 
                    value={(Object.keys(currentQuery.results).length / currentQuery.selectedAgents.length) * 100} 
                    className="w-full" 
                  />
                </div>
              )}

              {Object.keys(currentQuery.results).length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-semibold">Agent Responses</h4>
                  {Object.values(currentQuery.results).map((response: AgentResponse) => (
                    <Card key={response.agentId} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium">{response.agentName}</h5>
                            <p className="text-sm text-muted-foreground">
                              {response.model} • {response.latency}ms
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {response.tokensUsed} tokens
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed">{response.response}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      {queries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Research History</CardTitle>
            <CardDescription>
              Previous multi-agent research queries and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queries.slice(0, 5).map((query) => (
                <div key={query.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium truncate">{query.query}</p>
                    <p className="text-sm text-muted-foreground">
                      {query.selectedAgents.length} agents • {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(query.status)}>
                      {getStatusIcon(query.status)}
                      <span className="ml-1 capitalize">{query.status}</span>
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
