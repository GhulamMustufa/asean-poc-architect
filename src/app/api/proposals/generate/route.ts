import { NextRequest, NextResponse } from 'next/server';
import { ALL_STARTUPS } from '@/data/startups';
import { ProposalOrchestrator } from '@/lib/ai/orchestrator';
import { EnterpriseChallenge } from '@/types';
import { ModelProvider } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, startupId, providerPreference } = body as {
      challenge?: EnterpriseChallenge;
      startupId?: string;
      providerPreference?: ModelProvider;
    };

    if (!challenge || !challenge.title || !challenge.problemDescription) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: challenge payload with title and problemDescription is required.' },
        { status: 400 }
      );
    }

    if (!startupId) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: startupId is required.' },
        { status: 400 }
      );
    }

    // Retrieve verified startup record
    const startup = ALL_STARTUPS.find((s) => s.id === startupId);
    if (!startup) {
      return NextResponse.json(
        { success: false, error: `Startup with ID "${startupId}" not found in curated knowledge base.` },
        { status: 404 }
      );
    }

    // Initialize orchestrator with server-side credentials
    const orchestrator = new ProposalOrchestrator({
      preferredProvider: providerPreference,
      geminiApiKey: process.env.GEMINI_API_KEY,
      ollamaHost: process.env.OLLAMA_HOST
    });

    const result = await orchestrator.generateProposal(challenge, startup, {
      preferredProvider: providerPreference,
      timeoutMs: 12000,
      maxRetries: 1
    });

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('[API /api/proposals/generate] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'An unexpected error occurred during proposal synthesis.'
      },
      { status: 500 }
    );
  }
}
