import { useState, useEffect, useCallback } from 'react';
import { encryptData, decryptData, generateSecureId } from '@/lib/crypto';
import { APIKey, APIKeyFormData, MultiAgentQuery } from '@/lib/api-keys';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

const STORAGE_KEY = 'gapalytics_api_keys';
const QUERIES_STORAGE_KEY = 'gapalytics_multi_queries';

export const useAPIKeys = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [queries, setQueries] = useState<MultiAgentQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load API keys from localStorage
  useEffect(() => {
    if (user) {
      const storedKeys = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (storedKeys) {
        try {
          setApiKeys(JSON.parse(storedKeys));
        } catch (error) {
          console.error('Failed to parse stored API keys:', error);
        }
      }

      const storedQueries = localStorage.getItem(`${QUERIES_STORAGE_KEY}_${user.id}`);
      if (storedQueries) {
        try {
          setQueries(JSON.parse(storedQueries));
        } catch (error) {
          console.error('Failed to parse stored queries:', error);
        }
      }
    }
  }, [user]);

  // Save API keys to localStorage
  const saveApiKeys = useCallback((keys: APIKey[]) => {
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(keys));
      setApiKeys(keys);
    }
  }, [user]);

  // Save queries to localStorage
  const saveQueries = useCallback((newQueries: MultiAgentQuery[]) => {
    if (user) {
      localStorage.setItem(`${QUERIES_STORAGE_KEY}_${user.id}`, JSON.stringify(newQueries));
      setQueries(newQueries);
    }
  }, [user]);

  // Add new API key
  const addAPIKey = useCallback(async (formData: APIKeyFormData, password: string) => {
    try {
      setIsLoading(true);
      
      const encryptedKey = await encryptData(formData.apiKey, password);
      
      const newKey: APIKey = {
        id: generateSecureId(),
        name: formData.name,
        provider: formData.provider,
        encryptedKey,
        isActive: true,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        metadata: {
          model: formData.model,
          endpoint: formData.endpoint,
          organization: formData.organization
        }
      };

      const updatedKeys = [...apiKeys, newKey];
      saveApiKeys(updatedKeys);

      toast({
        title: "API Key Added",
        description: `${formData.name} has been successfully added and encrypted.`,
      });

      return { success: true, key: newKey };
    } catch (error) {
      console.error('Failed to add API key:', error);
      toast({
        variant: "destructive",
        title: "Failed to Add API Key",
        description: "There was an error encrypting and storing your API key.",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys, saveApiKeys]);

  // Decrypt API key for use
  const decryptAPIKey = useCallback(async (keyId: string, password: string): Promise<string | null> => {
    try {
      const key = apiKeys.find(k => k.id === keyId);
      if (!key) {
        throw new Error('API key not found');
      }

      const decryptedKey = await decryptData(key.encryptedKey, password);
      
      // Update usage stats
      const updatedKeys = apiKeys.map(k => 
        k.id === keyId 
          ? { 
              ...k, 
              lastUsed: new Date().toISOString(),
              usageCount: k.usageCount + 1
            }
          : k
      );
      saveApiKeys(updatedKeys);

      return decryptedKey;
    } catch (error) {
      console.error('Failed to decrypt API key:', error);
      toast({
        variant: "destructive",
        title: "Decryption Failed",
        description: "Failed to decrypt API key. Check your password.",
      });
      return null;
    }
  }, [apiKeys, saveApiKeys]);

  // Update API key
  const updateAPIKey = useCallback((keyId: string, updates: Partial<APIKey>) => {
    const updatedKeys = apiKeys.map(key => 
      key.id === keyId ? { ...key, ...updates } : key
    );
    saveApiKeys(updatedKeys);

    toast({
      title: "API Key Updated",
      description: "Your API key has been successfully updated.",
    });
  }, [apiKeys, saveApiKeys]);

  // Delete API key
  const deleteAPIKey = useCallback((keyId: string) => {
    const updatedKeys = apiKeys.filter(key => key.id !== keyId);
    saveApiKeys(updatedKeys);

    toast({
      title: "API Key Deleted",
      description: "Your API key has been successfully removed.",
    });
  }, [apiKeys, saveApiKeys]);

  // Toggle API key active status
  const toggleAPIKeyStatus = useCallback((keyId: string) => {
    const updatedKeys = apiKeys.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    );
    saveApiKeys(updatedKeys);
  }, [apiKeys, saveApiKeys]);

  // Create multi-agent query
  const createMultiAgentQuery = useCallback((query: string, selectedAgentIds: string[]) => {
    const newQuery: MultiAgentQuery = {
      id: generateSecureId(),
      query,
      selectedAgents: selectedAgentIds,
      status: 'pending',
      results: {},
      createdAt: new Date().toISOString()
    };

    const updatedQueries = [...queries, newQuery];
    saveQueries(updatedQueries);

    return newQuery;
  }, [queries, saveQueries]);

  // Update query status
  const updateQueryStatus = useCallback((queryId: string, status: MultiAgentQuery['status'], results?: Record<string, any>) => {
    const updatedQueries = queries.map(query => 
      query.id === queryId 
        ? { 
            ...query, 
            status, 
            results: results || query.results,
            completedAt: status === 'completed' ? new Date().toISOString() : query.completedAt
          }
        : query
    );
    saveQueries(updatedQueries);
  }, [queries, saveQueries]);

  // Get active API keys
  const getActiveAPIKeys = useCallback(() => {
    return apiKeys.filter(key => key.isActive);
  }, [apiKeys]);

  // Get API key by ID
  const getAPIKeyById = useCallback((keyId: string) => {
    return apiKeys.find(key => key.id === keyId);
  }, [apiKeys]);

  return {
    apiKeys,
    queries,
    isLoading,
    addAPIKey,
    decryptAPIKey,
    updateAPIKey,
    deleteAPIKey,
    toggleAPIKeyStatus,
    createMultiAgentQuery,
    updateQueryStatus,
    getActiveAPIKeys,
    getAPIKeyById
  };
};
