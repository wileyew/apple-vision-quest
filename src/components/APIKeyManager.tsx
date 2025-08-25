import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Key,
  Settings,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAPIKeys } from '@/hooks/useAPIKeys';
import { PROVIDER_CONFIGS, type ProviderType } from '@/lib/api-keys';
import { toast } from '@/hooks/use-toast';

const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.enum(['openai', 'anthropic', 'google', 'custom'] as const),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().optional(),
  endpoint: z.string().optional(),
  organization: z.string().optional(),
});

type APIKeyFormData = z.infer<typeof apiKeySchema>;

export const APIKeyManager = () => {
  const { apiKeys, addAPIKey, updateAPIKey, deleteAPIKey, toggleAPIKeyStatus } = useAPIKeys();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<APIKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      provider: 'openai',
      apiKey: '',
      model: '',
      endpoint: '',
      organization: '',
    },
  });

  const resetForm = () => {
    form.reset();
    setPassword('');
    setShowPassword(false);
    setEditingKey(null);
  };

  const handleSubmit = async (data: APIKeyFormData) => {
    if (!password) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your encryption password to secure your API key.",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingKey) {
        // Update existing key
        await updateAPIKey(editingKey, {
          name: data.name,
          provider: data.provider,
          metadata: {
            model: data.model,
            endpoint: data.endpoint,
            organization: data.organization
          }
        });
        toast({
          title: "API Key Updated",
          description: "Your API key has been successfully updated.",
        });
      } else {
        // Add new key
        const result = await addAPIKey(data, password);
        if (result.success) {
          setIsDialogOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (key) {
      setEditingKey(keyId);
      form.reset({
        name: key.name,
        provider: key.provider,
        apiKey: '••••••••••••••••', // Don't show actual key
        model: key.metadata?.model || '',
        endpoint: key.metadata?.endpoint || '',
        organization: key.metadata?.organization || '',
      });
      setIsDialogOpen(true);
    }
  };

  const handleDelete = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      deleteAPIKey(keyId);
    }
  };

  const getProviderIcon = (provider: ProviderType) => {
    return PROVIDER_CONFIGS[provider].icon;
  };

  const getProviderName = (provider: ProviderType) => {
    return PROVIDER_CONFIGS[provider].name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">
            Securely store and manage your AI service API keys
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingKey ? 'Edit API Key' : 'Add New API Key'}
              </DialogTitle>
              <DialogDescription>
                {editingKey 
                  ? 'Update your API key settings and metadata.'
                  : 'Add a new API key. It will be encrypted with your password for security.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., OpenAI Production"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={form.watch('provider')}
                    onValueChange={(value) => form.setValue('provider', value as ProviderType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROVIDER_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            {config.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!editingKey && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="sk-... or your API key"
                      {...form.register('apiKey')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.apiKey && (
                    <p className="text-sm text-red-600">{form.formState.errors.apiKey.message}</p>
                  )}
                </div>
              )}

              {form.watch('provider') !== 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="model">Model (Optional)</Label>
                  <Select
                    value={form.watch('model') || ''}
                    onValueChange={(value) => form.setValue('model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_CONFIGS[form.watch('provider')].models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.watch('provider') === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Custom Endpoint</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://your-api-endpoint.com"
                    {...form.register('endpoint')}
                  />
                </div>
              )}

              {form.watch('provider') === 'openai' && (
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization ID (Optional)</Label>
                  <Input
                    id="organization"
                    placeholder="org-..."
                    {...form.register('organization')}
                  />
                </div>
              )}

              {!editingKey && (
                <div className="space-y-2">
                  <Label htmlFor="password">Encryption Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password to encrypt your API key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This password will be used to encrypt your API key. Make sure to remember it.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingKey ? 'Update' : 'Add')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first API key to start using AI-powered market research
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getProviderIcon(key.provider)}</div>
                    <div>
                      <h3 className="font-semibold">{key.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getProviderName(key.provider)}
                        {key.metadata?.model && ` • ${key.metadata.model}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={key.isActive ? "default" : "secondary"}>
                      {key.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAPIKeyStatus(key.id)}
                    >
                      {key.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span>Used {key.usageCount} times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Added {new Date(key.createdAt).toLocaleDateString()}</span>
                  </div>
                  {key.lastUsed && (
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <span>Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(key.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(key.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
