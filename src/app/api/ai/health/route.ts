import { NextResponse } from 'next/server';
import { universalAIGateway } from '@/lib/ai/gateway/universalGateway';

export async function GET() {
  try {
    const health = await universalAIGateway.checkAllHealth();
    const models = universalAIGateway.getAllModels();

    // Map health to ensure strictly no internal credentials or sensitive headers are exposed
    const safeHealth = health.map((h) => ({
      providerId: h.providerId,
      providerName: h.displayName,
      status: h.status, // 'connected' | 'unavailable' | 'not_configured'
      models: h.availableModels,
      errorNote: h.message,
      latencyMs: h.latencyMs
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers: safeHealth,
      models
    });
  } catch (err: any) {
    console.error('[API /api/ai/health] Health check failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed: ' + (err?.message || String(err))
      },
      { status: 500 }
    );
  }
}
