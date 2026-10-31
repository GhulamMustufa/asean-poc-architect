import { AIProvider, GatewayRequest, GatewayResponse, ModelDescriptor, ProviderHealth } from '../types';
import { extractAndParseJson } from '../jsonExtractor';

export class LocalOllamaProvider implements AIProvider {
  id = 'ollama';
  displayName = 'Local Ollama (Edge / Air-Gap Compatible)';
  providerType = 'local' as const;

  supportedModels: ModelDescriptor[] = [
    {
      id: 'gemma2:2b',
      displayName: 'Google Gemma 2 (2B Quantized)',
      providerId: 'ollama',
      providerType: 'local',
      contextTokens: 8192,
      isRecommended: true,
      notes: 'Lightweight on-device model, fast CPU/Metal execution on Apple Silicon'
    },
    {
      id: 'qwen2.5-coder:3b',
      displayName: 'Qwen 2.5 Coder (3B Quantized)',
      providerId: 'ollama',
      providerType: 'local',
      contextTokens: 8192,
      notes: 'Technical architecture and integration schema generation specialist'
    }
  ];

  private getBaseUrl(): string {
    const raw = (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://localhost:11434').trim();
    return raw.replace(/\/+$/, '');
  }

  private getDefaultModel(): string {
    return (process.env.OLLAMA_DEFAULT_MODEL || 'gemma2:2b').trim();
  }

  isConfigured(): boolean {
    return true; // Local inference defaults to http://localhost:11434
  }

  async healthCheck(): Promise<ProviderHealth> {
    const checkedAt = new Date().toISOString();
    const baseUrl = this.getBaseUrl();
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: controller.signal
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        return {
          providerId: this.id,
          displayName: this.displayName,
          providerType: this.providerType,
          status: 'unavailable',
          availableModels: [],
          latencyMs,
          message: `Ollama returned HTTP ${res.status}. Is Ollama active?`,
          checkedAt
        };
      }

      const json = await res.json();
      const installedModels: string[] = (json?.models || []).map((m: any) => m.name || m.model);

      const targetModels = this.supportedModels.map(m => m.id);
      const matchingInstalled = targetModels.filter(m =>
        installedModels.some(inst => inst === m || inst.startsWith(`${m}:`))
      );

      if (matchingInstalled.length === 0) {
        return {
          providerId: this.id,
          displayName: this.displayName,
          providerType: this.providerType,
          status: 'unavailable',
          availableModels: installedModels,
          latencyMs,
          message: `Ollama is running, but required models (${targetModels.join(', ')}) are not installed. Run: 'ollama pull gemma2:2b'`,
          checkedAt
        };
      }

      return {
        providerId: this.id,
        displayName: this.displayName,
        providerType: this.providerType,
        status: 'connected',
        availableModels: matchingInstalled,
        latencyMs,
        message: `Ollama is active with ${matchingInstalled.join(', ')} ready for local inference.`,
        checkedAt
      };
    } catch (err: any) {
      return {
        providerId: this.id,
        displayName: this.displayName,
        providerType: this.providerType,
        status: 'unavailable',
        availableModels: [],
        message: 'Ollama daemon is not running on localhost:11434. Start Ollama to enable local edge execution.',
        checkedAt
      };
    }
  }

  async generateStructuredOutput<T>(
    request: GatewayRequest<T>,
    signal?: AbortSignal
  ): Promise<GatewayResponse<T>> {
    const startTime = Date.now();
    const baseUrl = this.getBaseUrl();
    const modelId = request.preferredModelId && this.supportedModels.some(m => m.id === request.preferredModelId)
      ? request.preferredModelId
      : this.getDefaultModel();

    const timeoutMs = request.timeoutMs || 20000; // Local inference needs up to 20s
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      // 1. Verify that model is installed before starting generation
      const tagsRes = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal }).catch(() => null);
      if (!tagsRes || !tagsRes.ok) {
        throw new Error(`Cannot reach Ollama at ${baseUrl}. Ensure the Ollama app or daemon is started.`);
      }

      const tagsJson = await tagsRes.json();
      const installed: string[] = (tagsJson?.models || []).map((m: any) => m.name || m.model);
      const isModelPresent = installed.some(inst => inst === modelId || inst.startsWith(`${modelId}:`));

      if (!isModelPresent) {
        throw new Error(
          `Model "${modelId}" is not installed in local Ollama. To install without auto-download, open Terminal and run: 'ollama pull ${modelId}'`
        );
      }

      // 2. Execute structured completion
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          system: `${request.systemInstruction}\n\nSTRICT REQUIREMENT: Respond ONLY with a valid JSON object matching the requested schema. No code fences or comments.`,
          prompt: request.userPrompt,
          format: 'json',
          stream: false,
          options: {
            temperature: request.temperature ?? 0.1,
            num_ctx: 8192
          }
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ollama API HTTP Error (${res.status}): ${errorText.substring(0, 150)}`);
      }

      const json = await res.json();
      const rawText = json?.response;

      if (!rawText) {
        throw new Error('Empty response received from local Ollama model.');
      }

      const parsed = extractAndParseJson<T>(rawText);
      const validated = request.expectedSchema.parse(parsed);

      return {
        success: true,
        providerId: this.id,
        providerName: this.displayName,
        modelId,
        structuredData: validated,
        latencyMs: Date.now() - startTime,
        fallbackUsed: false
      };
    } catch (err: any) {
      const isTimeout = err?.name === 'AbortError' || err?.message?.includes('timeout') || err?.message?.includes('aborted');
      return {
        success: false,
        providerId: this.id,
        providerName: this.displayName,
        modelId,
        latencyMs: Date.now() - startTime,
        fallbackUsed: false,
        errorCode: isTimeout ? 'ERR_TIMEOUT' : 'ERR_EXECUTION_FAILED',
        errorMessage: isTimeout ? `Local Ollama timed out after ${timeoutMs}ms` : (err?.message || 'Unknown Ollama error')
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
