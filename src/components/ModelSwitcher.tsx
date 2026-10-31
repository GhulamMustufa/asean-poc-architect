'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ModelConfig {
  preferredModelId: string; // 'auto' | 'gemma-4-31b-it' | 'groq-instant' | 'gemma2:2b' | 'qwen2.5-coder:3b' | 'deterministic-demo-engine'
  localOnlyMode: boolean;
  enableFallback: boolean;
  simulateFailure: boolean; // Hackathon jury demonstration mode
}

interface ProviderHealthStatus {
  providerId: string;
  providerName: string;
  status: 'connected' | 'unavailable' | 'not_configured';
  models: string[];
  errorNote?: string;
  latencyMs?: number;
}

const STORAGE_KEY = 'asean_ai_gateway_settings';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  preferredModelId: 'auto',
  localOnlyMode: false,
  enableFallback: true,
  simulateFailure: false
};

export function getStoredModelConfig(): ModelConfig {
  if (typeof window === 'undefined') return DEFAULT_MODEL_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MODEL_CONFIG;
    return { ...DEFAULT_MODEL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MODEL_CONFIG;
  }
}

export function saveModelConfig(config: ModelConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('ai_gateway_config_changed', { detail: config }));
}

export function ModelSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [health, setHealth] = useState<ProviderHealthStatus[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load stored config on mount
  useEffect(() => {
    setConfig(getStoredModelConfig());
    fetchHealth();

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json.providers || []);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('[ModelSwitcher] Health check error:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleSelectModel = (modelId: string) => {
    const updated = { ...config, preferredModelId: modelId };
    setConfig(updated);
    saveModelConfig(updated);
  };

  const handleToggleLocalOnly = () => {
    const updated = { ...config, localOnlyMode: !config.localOnlyMode };
    setConfig(updated);
    saveModelConfig(updated);
  };

  const handleToggleFallback = () => {
    const updated = { ...config, enableFallback: !config.enableFallback };
    setConfig(updated);
    saveModelConfig(updated);
  };

  const handleToggleSimulateFailure = () => {
    const updated = { ...config, simulateFailure: !config.simulateFailure };
    setConfig(updated);
    saveModelConfig(updated);
  };

  const getProviderStatus = (providerId: string): { label: string; color: string; note?: string } => {
    if (loadingHealth) return { label: 'Checking', color: '#94a3b8' };
    const p = health.find(h => h.providerId === providerId);
    if (!p) return { label: 'Checking', color: '#94a3b8' };
    if (p.status === 'connected') return { label: 'Connected', color: '#10b981' };
    if (p.status === 'not_configured') return { label: 'Not Configured', color: '#f59e0b', note: p.errorNote };
    return { label: 'Unavailable', color: '#ef4444', note: p.errorNote };
  };

  // Label for active button in navbar
  const getActiveDisplayLabel = () => {
    if (config.preferredModelId === 'auto') return 'AI: Auto Cascade';
    if (config.preferredModelId === 'gemma-4-31b-it') return 'AI: Google Gemma 4';
    if (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') return 'AI: Groq Fast';
    if (config.preferredModelId === 'gemma2:2b') return 'AI: Ollama Gemma 2B';
    if (config.preferredModelId === 'qwen2.5-coder:3b') return 'AI: Ollama Qwen 3B';
    if (config.preferredModelId === 'deterministic-demo-engine') return 'AI: Offline Demo Engine';
    return `AI: ${config.preferredModelId}`;
  };

  const googleStatus = getProviderStatus('google');
  const groqStatus = getProviderStatus('groq');
  const ollamaStatus = getProviderStatus('ollama');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        id="ai-model-switcher-button"
        className="btn btn-secondary btn-sm flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          padding: '0.35rem 0.65rem',
          border: config.simulateFailure ? '1px dashed #ef4444' : config.localOnlyMode ? '1px solid #10b981' : '1px solid #cbd5e1',
          background: config.simulateFailure ? '#fef2f2' : config.localOnlyMode ? '#f0fdf4' : '#ffffff'
        }}
        title="Universal AI Gateway: Multi-Model Routing & Automatic Failover"
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: config.simulateFailure ? '#ef4444' : config.localOnlyMode ? '#10b981' : '#3b82f6',
            display: 'inline-block'
          }}
        />
        <span style={{ fontWeight: 600 }}>{getActiveDisplayLabel()}</span>
        {config.localOnlyMode && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '1px 4px', borderRadius: '4px' }}>Edge Only</span>}
        {config.simulateFailure && <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#991b1b', padding: '1px 4px', borderRadius: '4px' }}>Sim Failure</span>}
        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▼</span>
      </button>

      {isOpen && (
        <div
          id="ai-model-switcher-panel"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: '360px',
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            padding: '0.75rem',
            fontSize: '0.82rem'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Universal AI Gateway</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Provider-Independent Multi-Model Routing</div>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: loadingHealth ? 'wait' : 'pointer'
              }}
            >
              {loadingHealth ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {/* Model Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.8rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Model or Strategy:
            </div>

            {/* Option 1: Automatic Routing */}
            <div
              onClick={() => handleSelectModel('auto')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: config.preferredModelId === 'auto' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: config.preferredModelId === 'auto' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Automatic — Recommended</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Google Gemma 4 ➔ Groq ➔ Ollama ➔ Cache</div>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Cascade
              </span>
            </div>

            {/* Option 2: Google Gemma 4 */}
            <div
              onClick={() => handleSelectModel('gemma-4-31b-it')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: config.preferredModelId === 'gemma-4-31b-it' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: config.preferredModelId === 'gemma-4-31b-it' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.5 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Google Gemma 4 (31B IT)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cloud • High-Reasoning Sovereign Synthesis</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: googleStatus.color, fontWeight: 600 }}>
                ● {googleStatus.label}
              </span>
            </div>

            {/* Option 3: Groq High-Speed */}
            <div
              onClick={() => handleSelectModel('llama-3.1-8b-instant')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.5 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Groq Cloud (Instant LPU)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cloud • Sub-second rapid demo generation</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: groqStatus.color, fontWeight: 600 }}>
                ● {groqStatus.label}
              </span>
            </div>

            {/* Option 4: Local Ollama Gemma 2 2B */}
            <div
              onClick={() => handleSelectModel('gemma2:2b')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: config.preferredModelId === 'gemma2:2b' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: config.preferredModelId === 'gemma2:2b' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Local Ollama (Gemma 2:2B)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Local Metal/CPU • Private & Air-Gap Friendly</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: ollamaStatus.color, fontWeight: 600 }}>
                ● {ollamaStatus.label}
              </span>
            </div>

            {/* Option 5: Local Ollama Qwen 2.5 Coder 3B */}
            <div
              onClick={() => handleSelectModel('qwen2.5-coder:3b')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: config.preferredModelId === 'qwen2.5-coder:3b' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: config.preferredModelId === 'qwen2.5-coder:3b' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Local Ollama (Qwen 2.5:3B)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Local Metal/CPU • Architecture Specialist</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: ollamaStatus.color, fontWeight: 600 }}>
                ● {ollamaStatus.label}
              </span>
            </div>

            {/* Option 6: Deterministic Offline Demo Engine */}
            <div
              onClick={() => handleSelectModel('deterministic-demo-engine')}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: config.preferredModelId === 'deterministic-demo-engine' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: config.preferredModelId === 'deterministic-demo-engine' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Offline Grounded Demo Engine</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Zero Network • Rule-bound Ground Truth Fallback</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                ● Always Ready
              </span>
            </div>
          </div>

          {/* Controls & Governance Toggles */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
              Execution Policy & Toggles:
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem' }}>
              <span>Automatic Failover Cascade</span>
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={handleToggleFallback}
                style={{ cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem' }}>
              <span title="Disallows all outbound cloud API calls (Google/Groq)">Local-Only Mode (Zero Cloud)</span>
              <input
                type="checkbox"
                checked={config.localOnlyMode}
                onChange={handleToggleLocalOnly}
                style={{ cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem', color: config.simulateFailure ? '#b91c1c' : '#475569' }}>
              <span title="Demonstrate automatic cloud failure recovery to judges">Simulate Cloud Failure (Demo Mode)</span>
              <input
                type="checkbox"
                checked={config.simulateFailure}
                onChange={handleToggleSimulateFailure}
                style={{ cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Status Note Footer */}
          <div style={{ marginTop: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem', fontSize: '0.68rem', color: '#64748b' }}>
            {lastChecked && <div>Health verified: {lastChecked}</div>}
            <div style={{ fontStyle: 'italic', marginTop: '2px' }}>
              Keys stored server-side. Zero API keys exposed to browser bundles.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
