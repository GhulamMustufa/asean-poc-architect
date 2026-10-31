import {
  AIProvider,
  GatewayExecutionMetadata,
  GatewayRequest,
  GatewayResponse,
  ModelDescriptor,
  ProviderHealth,
  TaskType
} from './types';
import { GoogleProvider } from './providers/googleProvider';
import { GroqProvider } from './providers/groqProvider';
import { LocalOllamaProvider } from './providers/ollamaProvider';
import { DeterministicCachedFallbackProvider } from './providers/fallbackProvider';
import { gatewayCache } from './cache';

export interface GatewayConfig {
  preferredModelId?: string; // 'auto' | 'gemma-4-31b-it' | 'groq-instant' | 'gemma2:2b' | 'qwen2.5-coder:3b' | 'deterministic-demo-engine'
  localOnlyMode?: boolean; // When true, STRICTLY disallow all outbound cloud calls
  enableFallback?: boolean;
  cloudTimeoutMs?: number;
  localTimeoutMs?: number;
  overallDeadlineMs?: number;
}

export class UniversalAIGateway {
  private googleProvider: GoogleProvider;
  private groqProvider: GroqProvider;
  private ollamaProvider: LocalOllamaProvider;
  private fallbackProvider: DeterministicCachedFallbackProvider;
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.googleProvider = new GoogleProvider();
    this.groqProvider = new GroqProvider();
    this.ollamaProvider = new LocalOllamaProvider();
    this.fallbackProvider = new DeterministicCachedFallbackProvider();

    this.providers.set(this.googleProvider.id, this.googleProvider);
    this.providers.set(this.groqProvider.id, this.groqProvider);
    this.providers.set(this.ollamaProvider.id, this.ollamaProvider);
    this.providers.set(this.fallbackProvider.id, this.fallbackProvider);
  }

  /**
   * Retrieves all registered providers.
   */
  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Returns a flattened list of all supported models across all providers.
   */
  getAllModels(): ModelDescriptor[] {
    const list: ModelDescriptor[] = [];
    for (const p of this.providers.values()) {
      list.push(...p.supportedModels);
    }
    return list;
  }

  /**
   * Health checks all configured providers in parallel.
   */
  async checkAllHealth(): Promise<ProviderHealth[]> {
    const checks = Array.from(this.providers.values()).map(p => p.healthCheck());
    return Promise.all(checks);
  }

  /**
   * Resolves the primary and failover sequence based on user preference, task type,
   * and local-only mode constraints.
   */
  private resolveExecutionPlan(
    taskType: TaskType,
    config: GatewayConfig,
    request: GatewayRequest
  ): { primary: AIProvider; modelId?: string; fallbackChain: AIProvider[] } {
    // 1. EXPLICIT DETERMINISTIC DEMO ENGINE (Zero Network / Absolute Air-Gap)
    if (config.preferredModelId === 'deterministic-demo-engine') {
      return {
        primary: this.fallbackProvider,
        modelId: 'deterministic-demo-engine',
        fallbackChain: []
      };
    }

    // 2. LOCAL-ONLY MODE ENFORCEMENT
    // If user explicitly requests local-only mode or residency requires local processing,
    // Cloud providers are STRICTLY excluded from the candidate sequence and fallback chain.
    if (config.localOnlyMode || request.allowCloud === false) {
      const preferredModel = config.preferredModelId?.includes('qwen') ? 'qwen2.5-coder:3b' : 'gemma2:2b';
      return {
        primary: this.ollamaProvider,
        modelId: preferredModel,
        fallbackChain: []
      };
    }

    // 3. EXPLICIT USER PREFERRED MODEL SELECTION
    if (config.preferredModelId && config.preferredModelId !== 'auto') {
      const targetModelId = config.preferredModelId;

      if (targetModelId.startsWith('gemma-4') || targetModelId.startsWith('gemini')) {
        return {
          primary: this.googleProvider,
          modelId: targetModelId,
          fallbackChain: [this.groqProvider, this.ollamaProvider]
        };
      }

      if (targetModelId.includes('llama') || targetModelId.includes('groq')) {
        return {
          primary: this.groqProvider,
          modelId: targetModelId,
          fallbackChain: [this.googleProvider, this.ollamaProvider]
        };
      }

      if (targetModelId.startsWith('gemma2') || targetModelId.startsWith('qwen')) {
        return {
          primary: this.ollamaProvider,
          modelId: targetModelId,
          fallbackChain: [this.googleProvider, this.groqProvider]
        };
      }

      if (targetModelId === 'deterministic-demo-engine') {
        return {
          primary: this.fallbackProvider,
          modelId: targetModelId,
          fallbackChain: []
        };
      }
    }

    // 4. TASK-BASED AUTOMATIC ROUTING POLICY
    switch (taskType) {
      case 'technical_compatibility' as any:
        return {
          primary: this.ollamaProvider,
          modelId: 'qwen2.5-coder:3b',
          fallbackChain: [this.googleProvider, this.groqProvider]
        };

      case 'quick_demo':
        return {
          primary: this.groqProvider,
          fallbackChain: [this.googleProvider, this.ollamaProvider]
        };

      case 'proposal_synthesis':
      case 'business_understanding':
      case 'pilot_scoping':
      case 'roadmap_generation':
      case 'kpi_design':
      case 'risk_compliance':
      default:
        // Priority: Google Gemma 4 -> Groq LPU -> Local Ollama -> Validated Cache -> Deterministic Fallback
        return {
          primary: this.googleProvider.isConfigured() ? this.googleProvider : this.groqProvider.isConfigured() ? this.groqProvider : this.ollamaProvider,
          fallbackChain: [this.groqProvider, this.ollamaProvider]
        };
    }
  }

  /**
   * Core Gateway execution method orchestrating primary call, failover cascade,
   * timeouts, caching, and execution transparency metadata.
   */
  async execute<T>(
    request: GatewayRequest<T>,
    config: GatewayConfig = {},
    cacheContext?: { challengeSignature: string; startupSignature: string }
  ): Promise<GatewayResponse<T>> {
    const overallDeadlineMs = config.overallDeadlineMs || 30000;
    const cloudTimeoutMs = config.cloudTimeoutMs || 8000;
    const localTimeoutMs = config.localTimeoutMs || 20000;

    const startTime = Date.now();
    const plan = this.resolveExecutionPlan(request.taskType, config, request);

    // Filter candidate sequence: ensure unique providers in sequence
    const candidateSequence: { provider: AIProvider; modelId?: string }[] = [];
    const seenProviderIds = new Set<string>();

    candidateSequence.push({ provider: plan.primary, modelId: plan.modelId });
    seenProviderIds.add(plan.primary.id);

    if (config.enableFallback !== false) {
      for (const fb of plan.fallbackChain) {
        if (!seenProviderIds.has(fb.id)) {
          // If local-only mode, never add cloud providers to fallback chain
          if (config.localOnlyMode && fb.providerType === 'cloud') {
            continue;
          }
          candidateSequence.push({ provider: fb });
          seenProviderIds.add(fb.id);
        }
      }
    }

    const fallbackRecord: string[] = [];
    let lastErrorReason: string | undefined;

    // Execute candidates in cascade order
    for (let i = 0; i < candidateSequence.length; i++) {
      const { provider, modelId } = candidateSequence[i];
      const isPrimary = i === 0;

      // Check if global deadline exceeded
      if (Date.now() - startTime >= overallDeadlineMs) {
        console.warn(`[AIGateway] Overall deadline (${overallDeadlineMs}ms) exceeded.`);
        break;
      }

      // Check configuration
      if (!provider.isConfigured() && provider.providerType === 'cloud') {
        fallbackRecord.push(`${provider.displayName}: Not configured (missing API key)`);
        continue;
      }

      const specificTimeout = provider.providerType === 'cloud' ? cloudTimeoutMs : localTimeoutMs;
      const effectiveRequest: GatewayRequest<T> = {
        ...request,
        preferredModelId: modelId || request.preferredModelId,
        timeoutMs: specificTimeout
      };

      try {
        const response = await provider.generateStructuredOutput<T>(effectiveRequest);

        if (response.success && response.structuredData) {
          // Store in validated cache if applicable
          if (cacheContext && !request.isSensitiveData) {
            const cacheKey = gatewayCache.generateKey(
              request.taskType,
              cacheContext.challengeSignature,
              cacheContext.startupSignature
            );
            gatewayCache.set(
              cacheKey,
              request.taskType,
              response.structuredData,
              response.providerId,
              response.modelId,
              `${cacheContext.challengeSignature} -> ${cacheContext.startupSignature}`
            );
          }

          return {
            ...response,
            fallbackUsed: !isPrimary || response.fallbackUsed,
            fallbackChain: fallbackRecord,
            fallbackReason: fallbackRecord.length > 0 ? fallbackRecord.join(' ➔ ') : undefined
          };
        } else {
          lastErrorReason = response.errorMessage || 'Provider generation returned unsuccessful state.';
          fallbackRecord.push(`${provider.displayName}: ${lastErrorReason}`);
        }
      } catch (err: any) {
        lastErrorReason = err?.message || String(err);
        fallbackRecord.push(`${provider.displayName}: ${lastErrorReason}`);
      }
    }

    // 4. If all live providers fail, check if a previous validated result is in cache
    if (cacheContext) {
      const cacheKey = gatewayCache.generateKey(
        request.taskType,
        cacheContext.challengeSignature,
        cacheContext.startupSignature
      );
      const cached = gatewayCache.get<T>(cacheKey);

      if (cached) {
        return {
          success: true,
          providerId: cached.providerId,
          providerName: `${cached.providerId} (Cached)`,
          modelId: cached.modelId,
          structuredData: cached.data,
          latencyMs: Date.now() - startTime,
          fallbackUsed: true,
          isCachedResult: true,
          cacheTimestamp: cached.cachedAt,
          fallbackChain: fallbackRecord,
          fallbackReason: 'Activated verified cached demo result following provider cascade exhaustion.'
        };
      }
    }

    // 5. Ultimate deterministic fallback if not already executed
    try {
      const fbResponse = await this.fallbackProvider.generateStructuredOutput<T>(request);
      return {
        ...fbResponse,
        latencyMs: Date.now() - startTime,
        fallbackUsed: true,
        fallbackChain: fallbackRecord,
        fallbackReason: fallbackRecord.length > 0
          ? `Cascade exhausted (${fallbackRecord.join('; ')}). Activated deterministic demo engine.`
          : 'Activated deterministic demo engine.'
      };
    } catch (fbErr: any) {
      return {
        success: false,
        providerId: 'none',
        providerName: 'None',
        modelId: 'none',
        latencyMs: Date.now() - startTime,
        fallbackUsed: true,
        errorCode: 'ERR_ALL_PROVIDERS_FAILED',
        errorMessage: `All AI providers failed: ${fallbackRecord.join(' | ')}`
      };
    }
  }
}

// Global singleton instance for server execution
export const universalAIGateway = new UniversalAIGateway();
