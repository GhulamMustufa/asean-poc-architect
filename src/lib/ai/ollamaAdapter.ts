import { CuratedStartup, EnterpriseChallenge } from '@/types';
import { ModelAdapter, StructuredProposalOutput } from './modelAdapter.interface';
import { FullStructuredProposalStageSchema } from './schemas';

export class OllamaGemmaAdapter implements ModelAdapter {
  name = 'Ollama / Gemma Local Adapter (Privacy-Preserving Edge Model)';
  providerId = 'ollama-gemma' as const;

  private host: string;
  private model: string;

  constructor(host?: string, model: string = 'gemma2') {
    this.host = host || process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = model;
  }

  isAvailable(): boolean {
    return Boolean(this.host && this.host.trim().length > 0);
  }

  async generateStages(
    challenge: EnterpriseChallenge,
    startup: CuratedStartup,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<StructuredProposalOutput> {
    const timeoutMs = options?.timeoutMs || 20000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const prompt = `You are an enterprise pilot architect. Synthesize a 60-day Proof-of-Concept proposal in structured JSON.
Ground all details strictly in this input. Never invent startup facts or legal approvals. Mark all target KPIs as assumptions.

CHALLENGE:
${JSON.stringify(challenge)}

STARTUP:
${JSON.stringify(startup)}

Output STRICT JSON adhering to FullStructuredProposalStageSchema.`;

      const response = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.1
          }
        }),
        signal: options?.signal || controller.signal
      });

      if (!response.ok) {
        throw new Error(`Ollama API HTTP Error (${response.status})`);
      }

      const json = await response.json();
      const rawText = json?.response;

      if (!rawText) {
        throw new Error('Empty response from Ollama');
      }

      const parsed = JSON.parse(rawText);
      return FullStructuredProposalStageSchema.parse(parsed);
    } finally {
      clearTimeout(timer);
    }
  }
}
