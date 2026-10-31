import { z } from 'zod';

export type TaskType =
  | 'proposal_synthesis'
  | 'business_understanding'
  | 'pilot_scoping'
  | 'roadmap_generation'
  | 'kpi_design'
  | 'risk_compliance'
  | 'quick_demo';

export type ProviderType = 'cloud' | 'local' | 'fallback';

export type HealthStatus = 'connected' | 'unavailable' | 'not_configured' | 'checking';

export interface ProviderHealth {
  providerId: string;
  displayName: string;
  providerType: ProviderType;
  status: HealthStatus;
  availableModels: string[];
  latencyMs?: number;
  message?: string;
  checkedAt: string;
}

export interface ModelDescriptor {
  id: string;
  displayName: string;
  providerId: string;
  providerType: ProviderType;
  contextTokens: number;
  isRecommended?: boolean;
  notes?: string;
}

export interface GatewayRequest<T = any> {
  taskType: TaskType;
  systemInstruction: string;
  userPrompt: string;
  expectedSchema: z.ZodSchema<T>;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  preferredModelId?: string;
  isSensitiveData?: boolean;
  allowCloud?: boolean;
}

export interface GatewayResponse<T = any> {
  success: boolean;
  providerId: string;
  providerName: string;
  modelId: string;
  structuredData?: T;
  latencyMs: number;
  fallbackUsed: boolean;
  fallbackChain?: string[];
  fallbackReason?: string;
  isCachedResult?: boolean;
  cacheTimestamp?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface AIProvider {
  id: string;
  displayName: string;
  providerType: ProviderType;
  supportedModels: ModelDescriptor[];
  isConfigured(): boolean;
  healthCheck(): Promise<ProviderHealth>;
  generateStructuredOutput<T>(
    request: GatewayRequest<T>,
    signal?: AbortSignal
  ): Promise<GatewayResponse<T>>;
}

export interface GatewayExecutionMetadata {
  requestedModelId?: string;
  actualProviderId: string;
  actualProviderName: string;
  actualModelId: string;
  latencyMs: number;
  fallbackUsed: boolean;
  fallbackChain: string[];
  fallbackReason?: string;
  isCachedResult: boolean;
  cacheTimestamp?: string;
  timestamp: string;
}
