import { AIProvider, GatewayRequest, GatewayResponse, ModelDescriptor, ProviderHealth } from '../types';
import { extractAndParseJson } from '../jsonExtractor';

export class GroqProvider implements AIProvider {
  id = 'groq';
  displayName = 'Groq Cloud (High-Speed LPU)';
  providerType = 'cloud' as const;

  // Active production models on Groq
  supportedModels: ModelDescriptor[] = [
    {
      id: process.env.GROQ_MODEL_ID || 'llama-3.1-8b-instant',
      displayName: 'Groq High-Speed (Llama 3.1 8B Instant)',
      providerId: 'groq',
      providerType: 'cloud',
      contextTokens: 8192,
      isRecommended: true,
      notes: 'Sub-second inference optimized on Groq LPU chips'
    },
    {
      id: 'llama-3.3-70b-versatile',
      displayName: 'Groq Versatile (Llama 3.3 70B)',
      providerId: 'groq',
      providerType: 'cloud',
      contextTokens: 8192,
      notes: 'High-capacity reasoning on Groq LPU infrastructure'
    }
  ];

  private getApiKey(): string {
    return (process.env.GROQ_API_KEY || '').trim();
  }

  isConfigured(): boolean {
    return this.getApiKey().length > 0;
  }

  async healthCheck(): Promise<ProviderHealth> {
    const checkedAt = new Date().toISOString();
    if (!this.isConfigured()) {
      return {
        providerId: this.id,
        displayName: this.displayName,
        providerType: this.providerType,
        status: 'not_configured',
        availableModels: this.supportedModels.map(m => m.id),
        message: 'Missing GROQ_API_KEY in server environment variables.',
        checkedAt
      };
    }

    const startTime = Date.now();
    try {
      const apiKey = this.getApiKey();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        const json = await res.json();
        const liveModelIds = (json?.data || []).map((m: any) => m.id);

        return {
          providerId: this.id,
          displayName: this.displayName,
          providerType: this.providerType,
          status: 'connected',
          availableModels: liveModelIds.slice(0, 10),
          latencyMs,
          checkedAt
        };
      } else {
        const errorText = await res.text();
        return {
          providerId: this.id,
          displayName: this.displayName,
          providerType: this.providerType,
          status: 'unavailable',
          availableModels: this.supportedModels.map(m => m.id),
          latencyMs,
          message: `Groq API HTTP ${res.status}: ${errorText.substring(0, 100)}`,
          checkedAt
        };
      }
    } catch (err: any) {
      return {
        providerId: this.id,
        displayName: this.displayName,
        providerType: this.providerType,
        status: 'unavailable',
        availableModels: this.supportedModels.map(m => m.id),
        message: err?.name === 'AbortError' ? 'Connection timed out (4s)' : (err?.message || 'Connection refused'),
        checkedAt
      };
    }
  }

  async generateStructuredOutput<T>(
    request: GatewayRequest<T>,
    signal?: AbortSignal
  ): Promise<GatewayResponse<T>> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        providerId: this.id,
        providerName: this.displayName,
        modelId: request.preferredModelId || this.supportedModels[0].id,
        latencyMs: 0,
        fallbackUsed: false,
        errorCode: 'ERR_NOT_CONFIGURED',
        errorMessage: 'GROQ_API_KEY is not configured on the server.'
      };
    }

    const modelId = request.preferredModelId || process.env.GROQ_MODEL_ID || this.supportedModels[0].id;
    const timeoutMs = request.timeoutMs || 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: `${request.systemInstruction}\n\nCRITICAL: Respond STRICTLY with a valid JSON object matching the requested schema. No code fences, no conversational preface or postfix.`
            },
            {
              role: 'user',
              content: request.userPrompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: request.temperature ?? 0.1,
          max_tokens: request.maxOutputTokens ?? 4096
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Groq API HTTP Error (${res.status}): ${errorText.substring(0, 200)}`);
      }

      const json = await res.json();
      const rawText = json?.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Empty response content received from Groq API.');
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
        errorMessage: isTimeout ? `Groq provider timed out after ${timeoutMs}ms` : (err?.message || 'Unknown Groq API error')
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
