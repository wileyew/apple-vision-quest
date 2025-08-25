import { EncryptedData } from './crypto';

export interface APIKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  encryptedKey: EncryptedData;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  metadata?: {
    model?: string;
    endpoint?: string;
    organization?: string;
    [key: string]: any;
  };
}

export interface APIKeyFormData {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey: string;
  model?: string;
  endpoint?: string;
  organization?: string;
}

export interface MultiAgentQuery {
  id: string;
  query: string;
  selectedAgents: string[]; // API key IDs
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  response: string;
  model: string;
  tokensUsed: number;
  latency: number;
  timestamp: string;
}

export const PROVIDER_CONFIGS = {
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    endpoint: 'https://api.openai.com/v1',
    description: 'GPT-4 and GPT-3.5 models for text generation and analysis'
  },
  anthropic: {
    name: 'Anthropic',
    icon: '🧠',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    endpoint: 'https://api.anthropic.com',
    description: 'Claude models for advanced reasoning and analysis'
  },
  google: {
    name: 'Google AI',
    icon: '🔍',
    models: ['gemini-pro', 'gemini-pro-vision'],
    endpoint: 'https://generativelanguage.googleapis.com',
    description: 'Gemini models for multimodal AI capabilities'
  },
  custom: {
    name: 'Custom',
    icon: '⚙️',
    models: [],
    endpoint: '',
    description: 'Custom API endpoint with your own models'
  }
} as const;

export type ProviderType = keyof typeof PROVIDER_CONFIGS;
