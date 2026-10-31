'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ModelConfig {
  preferredModelId: string; // 'auto' | 'gemma-4-31b-it' | 'llama-3.1-8b-instant' | 'gemma2:2b' | 'qwen2.5-coder:3b' | 'deterministic-demo-engine'
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
  const [isHovered, setIsHovered] = useState(false);
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

  const getDotColor = () => {
    if (config.simulateFailure) return '#ef4444';
    if (config.localOnlyMode) return '#10b981';
    if (config.preferredModelId === 'gemma-4-31b-it') return googleStatus.color;
    if (config.preferredModelId === 'llama-3.1-8b-instant') return groqStatus.color;
    if (config.preferredModelId?.startsWith('gemma2') || config.preferredModelId?.startsWith('qwen')) return ollamaStatus.color;
    return '#38bdf8';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        id="ai-model-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          padding: '0.42rem 0.8rem',
          borderRadius: '999px',
          border: config.simulateFailure
            ? '1px dashed #ef4444'
            : config.localOnlyMode
            ? (isHovered ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.4)')
            : (isHovered ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.14)'),
          background: config.simulateFailure
            ? (isHovered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.12)')
            : config.localOnlyMode
            ? (isHovered ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.1)')
            : (isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)'),
          backdropFilter: 'blur(10px)',
          color: '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isHovered
            ? '0 4px 12px rgba(0, 0, 0, 0.35), 0 0 10px rgba(56, 189, 248, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.25)'
        }}
        title="Universal AI Gateway: Multi-Model Routing & Automatic Failover"
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getDotColor(),
            display: 'inline-block',
            boxShadow: `0 0 8px ${getDotColor()}`
          }}
        />
        <span style={{ color: '#f1f5f9', letterSpacing: '-0.01em' }}>{getActiveDisplayLabel()}</span>
        {config.localOnlyMode && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>
            Edge
          </span>
        )}
        {config.simulateFailure && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>
            Sim Fail
          </span>
        )}
        <span style={{ fontSize: '0.65rem', opacity: 0.6, marginLeft: '2px', color: '#94a3b8' }}>▼</span>
      </button>

      {isOpen && (
        <div
          id="ai-model-switcher-panel"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.6rem',
            width: '375px',
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            zIndex: 1000,
            padding: '0.9rem',
            fontSize: '0.82rem',
            color: '#f8fafc'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Universal AI Gateway</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '1px 6px', borderRadius: '999px' }}>v2.4</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Multi-Model Routing & Automatic Failover</div>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#cbd5e1',
                cursor: loadingHealth ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {loadingHealth ? 'Checking...' : '↻ Refresh Status'}
            </button>
          </div>

          {/* Model Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Active AI Model:
            </div>

            {/* Option 1: Automatic Routing */}
            <div
              onClick={() => handleSelectModel('auto')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'auto' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: config.preferredModelId === 'auto' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'auto' ? '#38bdf8' : '#f1f5f9', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Automatic (Recommended)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Google Gemma ➔ Groq ➔ Ollama ➔ Cache</div>
              </div>
              <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 7px', borderRadius: '999px', fontWeight: 600 }}>
                Cascade
              </span>
            </div>

            {/* Option 2: Google Gemma 4 */}
            <div
              onClick={() => handleSelectModel('gemma-4-31b-it')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'gemma-4-31b-it' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: config.preferredModelId === 'gemma-4-31b-it' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1,
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma-4-31b-it' ? '#38bdf8' : '#f1f5f9' }}>Google Gemma 4 (31B IT)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cloud • Deep Enterprise Reasoning Engine</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: googleStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: googleStatus.color }} />
                {googleStatus.label}
              </span>
            </div>

            {/* Option 3: Groq High-Speed */}
            <div
              onClick={() => handleSelectModel('llama-3.1-8b-instant')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1,
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '#38bdf8' : '#f1f5f9' }}>Groq Cloud (Instant LPU)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cloud • Sub-second rapid demo generation</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: groqStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: groqStatus.color }} />
                {groqStatus.label}
              </span>
            </div>

            {/* Option 4: Local Ollama Gemma 2 2B */}
            <div
              onClick={() => handleSelectModel('gemma2:2b')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'gemma2:2b' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: config.preferredModelId === 'gemma2:2b' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma2:2b' ? '#38bdf8' : '#f1f5f9' }}>Local Ollama (Gemma 2:2B)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Local Apple Silicon GPU • Air-Gap Friendly</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: ollamaStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ollamaStatus.color }} />
                {ollamaStatus.label}
              </span>
            </div>

            {/* Option 5: Local Ollama Qwen 2.5 Coder 3B */}
            <div
              onClick={() => handleSelectModel('qwen2.5-coder:3b')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'qwen2.5-coder:3b' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: config.preferredModelId === 'qwen2.5-coder:3b' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'qwen2.5-coder:3b' ? '#38bdf8' : '#f1f5f9' }}>Local Ollama (Qwen 2.5:3B)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Local Apple Silicon GPU • Schema Specialist</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: ollamaStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ollamaStatus.color }} />
                {ollamaStatus.label}
              </span>
            </div>

            {/* Option 6: Deterministic Offline Demo Engine */}
            <div
              onClick={() => handleSelectModel('deterministic-demo-engine')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'deterministic-demo-engine' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.06)',
                background: config.preferredModelId === 'deterministic-demo-engine' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'deterministic-demo-engine' ? '#38bdf8' : '#f1f5f9' }}>Offline Grounded Demo Engine</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Zero Network • 100% Guaranteed Reliability</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                Always Ready
              </span>
            </div>
          </div>

          {/* Controls & Governance Toggles */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Execution Policy & Toggles:
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: '#e2e8f0' }}>
              <span>Automatic Failover Cascade</span>
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={handleToggleFallback}
                style={{ cursor: 'pointer', accentColor: '#38bdf8' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: '#e2e8f0' }}>
              <span title="Strictly forbids all outbound cloud calls (Google/Groq)">Local-Only Mode (Zero Cloud)</span>
              <input
                type="checkbox"
                checked={config.localOnlyMode}
                onChange={handleToggleLocalOnly}
                style={{ cursor: 'pointer', accentColor: '#10b981' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: config.simulateFailure ? '#f87171' : '#cbd5e1' }}>
              <span title="Demonstrate automatic cloud failure recovery to judges">Simulate Cloud Failure (Demo Mode)</span>
              <input
                type="checkbox"
                checked={config.simulateFailure}
                onChange={handleToggleSimulateFailure}
                style={{ cursor: 'pointer', accentColor: '#ef4444' }}
              />
            </label>
          </div>

          {/* Status Note Footer */}
          <div style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.45rem', fontSize: '0.68rem', color: '#94a3b8' }}>
            {lastChecked && <div>Health verified: {lastChecked}</div>}
            <div style={{ fontStyle: 'italic', marginTop: '2px', color: '#64748b' }}>
              Keys stored server-side. Zero API credentials in browser bundles.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
