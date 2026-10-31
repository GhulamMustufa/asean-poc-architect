import { AIProvider, GatewayRequest, GatewayResponse, ModelDescriptor, ProviderHealth } from '../types';
import { extractAndParseJson } from '../jsonExtractor';

export class GoogleProvider implements AIProvider {
  id = 'google';
  displayName = 'Google Gemma 4 (Cloud)';
  providerType = 'cloud' as const;

  supportedModels: ModelDescriptor[] = [
    {
      id: 'gemma-4-31b-it',
      displayName: 'Google Gemma 4 (31B IT)',
      providerId: 'google',
      providerType: 'cloud',
      contextTokens: 16384,
      isRecommended: true,
      notes: 'Official Google Gemma 4 open-weights reasoning model hosted on Google AI Studio'
    },
    {
      id: 'gemma-4-26b-a4b-it',
      displayName: 'Google Gemma 4 (26B MoE)',
      providerId: 'google',
      providerType: 'cloud',
      contextTokens: 16384,
      notes: 'High-throughput Mixture-of-Experts architecture'
    },
    {
      id: 'gemini-2.0-flash',
      displayName: 'Google Gemini 2.0 Flash',
      providerId: 'google',
      providerType: 'cloud',
      contextTokens: 32768,
      notes: 'Ultra-low latency production cloud model'
    }
  ];

  private getApiKey(): string {
    return (
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      ''
    ).trim();
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
        message: 'Missing GOOGLE_AI_API_KEY in server environment variables.',
        checkedAt
      };
    }

    const startTime = Date.now();
    try {
      const apiKey = this.getApiKey();
      const model = this.supportedModels[0].id;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with: {"status":"ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
        }),
        signal: controller.signal
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        return {
          providerId: this.id,
          displayName: this.displayName,
          providerType: this.providerType,
          status: 'connected',
          availableModels: this.supportedModels.map(m => m.id),
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
          message: `Google API HTTP ${res.status}: ${errorText.substring(0, 100)}`,
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
        errorMessage: 'GOOGLE_AI_API_KEY is not set on the server.'
      };
    }

    const modelId = request.preferredModelId && this.supportedModels.some(m => m.id === request.preferredModelId)
      ? request.preferredModelId
      : this.supportedModels[0].id;

    const timeoutMs = request.timeoutMs || 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Link incoming signal to internal abort controller if provided
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: request.systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: request.userPrompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: request.temperature ?? 0.2,
            maxOutputTokens: request.maxOutputTokens ?? 4096
          }
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Google API HTTP Error (${res.status}): ${errorText.substring(0, 200)}`);
      }

      const json = await res.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty response content received from Google API.');
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
        errorMessage: isTimeout ? `Google provider timed out after ${timeoutMs}ms` : (err?.message || 'Unknown Google API error')
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
