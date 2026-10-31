import { CuratedStartup, EnterpriseChallenge } from '@/types';
import { ModelProvider } from './types';
import { z } from 'zod';
import { FullStructuredProposalStageSchema } from './schemas';

export type StructuredProposalOutput = z.infer<typeof FullStructuredProposalStageSchema>;

export interface ModelAdapter {
  name: string;
  providerId: ModelProvider;
  isAvailable(): boolean;
  generateStages(
    challenge: EnterpriseChallenge,
    startup: CuratedStartup,
    options?: { timeoutMs?: number; signal?: AbortSignal }
  ): Promise<StructuredProposalOutput>;
}
