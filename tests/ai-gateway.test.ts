import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import { UniversalAIGateway } from '../src/lib/ai/gateway/universalGateway';
import { GoogleProvider } from '../src/lib/ai/gateway/providers/googleProvider';
import { GroqProvider } from '../src/lib/ai/gateway/providers/groqProvider';
import { LocalOllamaProvider } from '../src/lib/ai/gateway/providers/ollamaProvider';
import { DeterministicCachedFallbackProvider } from '../src/lib/ai/gateway/providers/fallbackProvider';
import { gatewayCache } from '../src/lib/ai/gateway/cache';
import { extractAndParseJson } from '../src/lib/ai/gateway/jsonExtractor';
import { GatewayRequest } from '../src/lib/ai/gateway/types';

describe('Universal Multi-Model AI Gateway Comprehensive Tests', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  const testSchema = z.object({
    status: z.string(),
    summary: z.string(),
    deliverables: z.array(z.string()).min(1)
  });

  type TestPayload = z.infer<typeof testSchema>;

  const baseRequest: GatewayRequest<TestPayload> = {
    taskType: 'proposal_synthesis',
    systemInstruction: 'You are an enterprise AI architect.',
    userPrompt: 'Generate a pilot proposal.',
    expectedSchema: testSchema,
    temperature: 0.1,
    maxOutputTokens: 1024,
    allowCloud: true
  };

  beforeEach(() => {
    gatewayCache.clear();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  // =========================================================================
  // 1. JSON PARSING & EXTRACTION RESILIENCE
  // =========================================================================
  test('JSON Extractor: handles markdown fences, preamble, and raw JSON safely', () => {
    const raw = '```json\n{"status":"success","summary":"Plan ready","deliverables":["D1"]}\n```';
    const parsed = extractAndParseJson<TestPayload>(raw);
    assert.strictEqual(parsed.status, 'success');
    assert.strictEqual(parsed.deliverables[0], 'D1');

    const preamble = 'Here is the requested output:\n{"status":"ready","summary":"Preamble stripped","deliverables":["A"]}\nHope this helps!';
    const parsedPreamble = extractAndParseJson<TestPayload>(preamble);
    assert.strictEqual(parsedPreamble.status, 'ready');

    assert.throws(() => {
      extractAndParseJson('Not a JSON object at all');
    }, /No valid JSON structure/);
  });

  // =========================================================================
  // 2. GOOGLE PROVIDER TESTS
  // =========================================================================
  describe('Google Gemma Provider', () => {
    test('Google Provider: Missing API key returns ERR_NOT_CONFIGURED', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      const provider = new GoogleProvider();
      assert.strictEqual(provider.isConfigured(), false);

      const res = await provider.generateStructuredOutput(baseRequest);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.errorCode, 'ERR_NOT_CONFIGURED');
    });

    test('Google Provider: Successful mocked generation returns validated data', async () => {
      process.env.GOOGLE_AI_API_KEY = 'mock-google-key';
      const provider = new GoogleProvider();

      global.fetch = async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ status: 'ok', summary: 'Gemma 4 summary', deliverables: ['D1', 'D2'] }) }]
                }
              }
            ]
          })
        } as any;
      };

      const res = await provider.generateStructuredOutput(baseRequest);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'google');
      assert.strictEqual(res.structuredData?.summary, 'Gemma 4 summary');
      assert.strictEqual(res.structuredData?.deliverables.length, 2);
    });

    test('Google Provider: Zod schema failure rejects invalid response', async () => {
      process.env.GOOGLE_AI_API_KEY = 'mock-google-key';
      const provider = new GoogleProvider();

      global.fetch = async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ status: 'missing_deliverables_array' }) }]
                }
              }
            ]
          })
        } as any;
      };

      const res = await provider.generateStructuredOutput(baseRequest);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.errorCode, 'ERR_EXECUTION_FAILED');
    });

    test('Google Provider: Timeout triggers AbortError and returns ERR_TIMEOUT', async () => {
      process.env.GOOGLE_AI_API_KEY = 'mock-google-key';
      const provider = new GoogleProvider();

      global.fetch = async (_url, options: any) => {
        return new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        });
      };

      const res = await provider.generateStructuredOutput({ ...baseRequest, timeoutMs: 20 });
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.errorCode, 'ERR_TIMEOUT');
    });
  });

  // =========================================================================
  // 3. GROQ PROVIDER TESTS
  // =========================================================================
  describe('Groq High-Speed Provider', () => {
    test('Groq Provider: Missing GROQ_API_KEY returns not configured', async () => {
      delete process.env.GROQ_API_KEY;
      const provider = new GroqProvider();
      assert.strictEqual(provider.isConfigured(), false);

      const health = await provider.healthCheck();
      assert.strictEqual(health.status, 'not_configured');
    });

    test('Groq Provider: Successful mocked generation returns validated data', async () => {
      process.env.GROQ_API_KEY = 'mock-groq-key';
      const provider = new GroqProvider();

      global.fetch = async () => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ status: 'groq-success', summary: 'Groq LPU synthesized', deliverables: ['Fast1'] })
                }
              }
            ]
          })
        } as any;
      };

      const res = await provider.generateStructuredOutput(baseRequest);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'groq');
      assert.strictEqual(res.structuredData?.status, 'groq-success');
    });
  });

  // =========================================================================
  // 4. LOCAL OLLAMA PROVIDER TESTS
  // =========================================================================
  describe('Local Ollama Provider', () => {
    test('Ollama Provider: Connection refusal surfaces clear error note', async () => {
      const provider = new LocalOllamaProvider();

      global.fetch = async () => {
        throw new Error('connect ECONNREFUSED 127.0.0.1:11434');
      };

      const health = await provider.healthCheck();
      assert.strictEqual(health.status, 'unavailable');
      assert.ok(health.message?.includes('Ollama daemon is not running'));
    });

    test('Ollama Provider: Missing model refuses auto-download and returns instructions', async () => {
      const provider = new LocalOllamaProvider();

      global.fetch = async (url: any) => {
        if (String(url).includes('/api/tags')) {
          return {
            ok: true,
            json: async () => ({ models: [{ name: 'unrelated-model:latest' }] })
          } as any;
        }
        throw new Error('Should not reach generate when model is not installed');
      };

      const res = await provider.generateStructuredOutput({ ...baseRequest, preferredModelId: 'gemma2:2b' });
      assert.strictEqual(res.success, false);
      assert.ok(res.errorMessage?.includes('ollama pull gemma2:2b'));
    });

    test('Ollama Provider: Successful local inference validates output', async () => {
      const provider = new LocalOllamaProvider();

      global.fetch = async (url: any) => {
        if (String(url).includes('/api/tags')) {
          return {
            ok: true,
            json: async () => ({ models: [{ name: 'gemma2:2b' }] })
          } as any;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            response: JSON.stringify({ status: 'ollama-ok', summary: 'Local Gemma 2B execution', deliverables: ['EdgeDeliv'] })
          })
        } as any;
      };

      const res = await provider.generateStructuredOutput({ ...baseRequest, preferredModelId: 'gemma2:2b' });
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'ollama');
      assert.strictEqual(res.modelId, 'gemma2:2b');
      assert.strictEqual(res.structuredData?.deliverables[0], 'EdgeDeliv');
    });
  });

  // =========================================================================
  // 5. UNIVERSAL GATEWAY CASCADE & FAILOVER TESTS
  // =========================================================================
  describe('Universal Gateway Cascades and Governance', () => {
    test('Gateway: Primary provider failure automatically triggers secondary Groq provider', async () => {
      process.env.GOOGLE_AI_API_KEY = 'mock-google';
      process.env.GROQ_API_KEY = 'mock-groq';

      const gateway = new UniversalAIGateway();

      let fetchCount = 0;
      global.fetch = async (url: any) => {
        fetchCount++;
        // First call is Google (simulated 503 error)
        if (String(url).includes('googleapis.com')) {
          return {
            ok: false,
            status: 503,
            text: async () => 'Service Unavailable'
          } as any;
        }
        // Second call is Groq (successful)
        if (String(url).includes('groq.com')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({ status: 'recovered-by-groq', summary: 'Failover success', deliverables: ['Recovered'] })
                  }
                }
              ]
            })
          } as any;
        }
        throw new Error(`Unexpected url: ${url}`);
      };

      const res = await gateway.execute(baseRequest, { preferredModelId: 'gemma-4-31b-it', enableFallback: true });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'groq');
      assert.strictEqual(res.fallbackUsed, true);
      assert.ok(res.fallbackReason?.includes('Google Gemma 4'));
    });

    test('Gateway: Local-Only Mode strictly excludes all outbound cloud calls', async () => {
      process.env.GOOGLE_AI_API_KEY = 'mock-google';
      process.env.GROQ_API_KEY = 'mock-groq';

      const gateway = new UniversalAIGateway();
      let attemptedCloudUrls: string[] = [];

      global.fetch = async (url: any) => {
        const urlStr = String(url);
        if (urlStr.includes('googleapis.com') || urlStr.includes('groq.com')) {
          attemptedCloudUrls.push(urlStr);
        }
        // Mock Ollama tags and generation
        if (urlStr.includes('/api/tags')) {
          return { ok: true, json: async () => ({ models: [{ name: 'gemma2:2b' }] }) } as any;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            response: JSON.stringify({ status: 'local-only-pass', summary: 'No cloud contacted', deliverables: ['AirGapD1'] })
          })
        } as any;
      };

      const res = await gateway.execute(baseRequest, {
        localOnlyMode: true,
        preferredModelId: 'gemma2:2b'
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'ollama');
      assert.strictEqual(attemptedCloudUrls.length, 0, 'Zero cloud URLs must be contacted in local-only mode');
    });

    test('Gateway: Cascade exhaustion activates deterministic cached fallback', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      delete process.env.GROQ_API_KEY;

      const gateway = new UniversalAIGateway();

      // Mock Ollama failure as well
      global.fetch = async () => {
        throw new Error('Ollama offline');
      };

      const res = await gateway.execute(baseRequest, {
        cloudTimeoutMs: 50,
        localTimeoutMs: 50
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.providerId, 'fallback');
      assert.strictEqual(res.fallbackUsed, true);
      assert.ok(res.fallbackReason?.includes('deterministic demo engine') || res.fallbackReason?.includes('offline demo engine'));
    });

    test('Gateway: Cryptographic caching prevents redundant generation and recognizes cached results', async () => {
      const gateway = new UniversalAIGateway();

      // Seed cache
      const cacheKey = gatewayCache.generateKey('proposal_synthesis', 'chal-sig-01', 'start-sig-01');
      gatewayCache.set(
        cacheKey,
        'proposal_synthesis',
        { status: 'from-cache', summary: 'Cached response', deliverables: ['CacheD1'] },
        'google',
        'gemma-4-31b-it',
        'Signature verified'
      );

      // Force cloud failure
      global.fetch = async () => {
        throw new Error('All networks down');
      };

      const res = await gateway.execute(
        baseRequest,
        { cloudTimeoutMs: 50, localTimeoutMs: 50 },
        { challengeSignature: 'chal-sig-01', startupSignature: 'start-sig-01' }
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isCachedResult, true);
      assert.strictEqual(res.structuredData?.status, 'from-cache');
      assert.ok(res.fallbackReason?.includes('cached demo result'));
    });

    test('Gateway: Cache invalidation occurs when challenge signature changes', async () => {
      // Seed cache for Challenge A
      const keyA = gatewayCache.generateKey('proposal_synthesis', 'chal-A', 'start-A');
      gatewayCache.set(keyA, 'proposal_synthesis', { status: 'old-data', summary: 'Old', deliverables: ['Old'] }, 'google', 'gemma-4', 'Sig A');

      // Request for Challenge B with different input signature
      const keyB = gatewayCache.generateKey('proposal_synthesis', 'chal-B', 'start-A');
      const cachedB = gatewayCache.get(keyB);

      assert.strictEqual(cachedB, null, 'Cache must not match different challenge signatures');
    });
  });
});
