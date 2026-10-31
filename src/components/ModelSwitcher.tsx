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
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [health, setHealth] = useState<ProviderHealthStatus[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
    if (config.preferredModelId === 'auto') return 'Auto Cascade';
    if (config.preferredModelId === 'gemma-4-31b-it') return 'Google Gemma 4';
    if (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') return 'Groq Instant';
    if (config.preferredModelId === 'gemma2:2b') return 'Ollama Gemma 2B';
    if (config.preferredModelId === 'qwen2.5-coder:3b') return 'Ollama Qwen 3B';
    if (config.preferredModelId === 'deterministic-demo-engine') return 'Offline Engine';
    return config.preferredModelId;
  };

  const getActiveDotColor = () => {
    if (config.simulateFailure) return '#f43f5e';
    if (config.localOnlyMode) return '#10b981';
    if (config.preferredModelId === 'gemma-4-31b-it') return '#8b5cf6';
    if (config.preferredModelId.includes('llama') || config.preferredModelId.includes('groq')) return '#f59e0b';
    if (config.preferredModelId.includes('gemma2') || config.preferredModelId.includes('qwen')) return '#10b981';
    return '#38bdf8'; // Auto Cascade
  };

  const googleStatus = getProviderStatus('google');
  const groqStatus = getProviderStatus('groq');
  const ollamaStatus = getProviderStatus('ollama');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Sleek Dark Mode Trigger Button */}
      <button
        type="button"
        id="ai-model-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.815rem',
          padding: '0.38rem 0.75rem',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          color: '#f8fafc',
          background: config.simulateFailure
            ? 'rgba(244, 63, 94, 0.12)'
            : config.localOnlyMode
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(255, 255, 255, 0.06)',
          border: config.simulateFailure
            ? '1px solid rgba(244, 63, 94, 0.45)'
            : config.localOnlyMode
            ? '1px solid rgba(16, 185, 129, 0.45)'
            : '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
        }}
        title="Universal AI Gateway: Multi-Model Routing & Automatic Failover"
      >
        {/* Pulsing indicator dot */}
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getActiveDotColor(),
            display: 'inline-block',
            boxShadow: `0 0 8px ${getActiveDotColor()}`
          }}
        />

        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>AI:</span>
        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{getActiveDisplayLabel()}</span>

        {config.localOnlyMode && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
            Edge Only
          </span>
        )}
        {config.simulateFailure && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
            Sim Outage
          </span>
        )}

        <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginLeft: '0.15rem' }}>▼</span>
      </button>

      {/* Premium Dark Glass Popover Panel */}
      {isOpen && (
        <div
          id="ai-model-switcher-panel"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.6rem',
            width: '370px',
            background: 'linear-gradient(180deg, #131b2e 0%, #0d1322 100%)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            zIndex: 1000,
            padding: '0.85rem',
            fontSize: '0.82rem',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#38bdf8' }}>⚡</span> Universal AI Gateway
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Multi-Model Routing & Automatic Failover</div>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              style={{
                fontSize: '0.68rem',
                padding: '3px 7px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                cursor: loadingHealth ? 'wait' : 'pointer'
              }}
            >
              {loadingHealth ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {/* Model Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Active Engine:
            </div>

            {/* Option 1: Automatic Routing */}
            <div
              onClick={() => handleSelectModel('auto')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'auto' ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                background: config.preferredModelId === 'auto' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'auto' ? '#38bdf8' : '#f8fafc' }}>
                  Automatic (Recommended)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Gemma 4 ➔ Groq ➔ Ollama ➔ Cache</div>
              </div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                Smart Cascade
              </span>
            </div>

            {/* Option 2: Google Gemma 4 */}
            <div
              onClick={() => handleSelectModel('gemma-4-31b-it')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'gemma-4-31b-it' ? '1.5px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.08)',
                background: config.preferredModelId === 'gemma-4-31b-it' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma-4-31b-it' ? '#c084fc' : '#f8fafc' }}>
                  Google Gemma 4 (31B IT)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Cloud • High-Reasoning Strategic Synthesis</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: googleStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: googleStatus.color, display: 'inline-block' }} />
                {googleStatus.label}
              </span>
            </div>

            {/* Option 3: Groq High-Speed */}
            <div
              onClick={() => handleSelectModel('llama-3.1-8b-instant')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                background: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '#fbbf24' : '#f8fafc' }}>
                  Groq Cloud (Instant LPU)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Cloud • Sub-second rapid generation</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: groqStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: groqStatus.color, display: 'inline-block' }} />
                {groqStatus.label}
              </span>
            </div>

            {/* Option 4: Local Ollama Gemma 2 2B */}
            <div
              onClick={() => handleSelectModel('gemma2:2b')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'gemma2:2b' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                background: config.preferredModelId === 'gemma2:2b' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma2:2b' ? '#34d399' : '#f8fafc' }}>
                  Local Ollama (Gemma 2:2B)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>On-Device GPU • Private & Air-Gap Friendly</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: ollamaStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ollamaStatus.color, display: 'inline-block' }} />
                {ollamaStatus.label}
              </span>
            </div>

            {/* Option 5: Local Ollama Qwen 2.5 Coder 3B */}
            <div
              onClick={() => handleSelectModel('qwen2.5-coder:3b')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'qwen2.5-coder:3b' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                background: config.preferredModelId === 'qwen2.5-coder:3b' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'qwen2.5-coder:3b' ? '#34d399' : '#f8fafc' }}>
                  Local Ollama (Qwen 2.5:3B)
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>On-Device GPU • Architecture Specialist</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: ollamaStatus.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ollamaStatus.color, display: 'inline-block' }} />
                {ollamaStatus.label}
              </span>
            </div>

            {/* Option 6: Offline Grounded Demo Engine */}
            <div
              onClick={() => handleSelectModel('deterministic-demo-engine')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'deterministic-demo-engine' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                background: config.preferredModelId === 'deterministic-demo-engine' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'deterministic-demo-engine' ? '#34d399' : '#f8fafc' }}>
                  Offline Grounded Demo Engine
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Zero Network • Pre-calibrated Truth Engine</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                Always Ready
              </span>
            </div>
          </div>

          {/* Controls & Governance Toggles */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Execution Policy & Toggles:
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem', color: '#cbd5e1' }}>
              <span>Automatic Failover Cascade</span>
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={handleToggleFallback}
                style={{ cursor: 'pointer', accentColor: '#38bdf8' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem', color: config.localOnlyMode ? '#34d399' : '#cbd5e1' }}>
              <span title="Disallows all outbound cloud API calls (Google/Groq)">Local-Only Mode (Zero Cloud)</span>
              <input
                type="checkbox"
                checked={config.localOnlyMode}
                onChange={handleToggleLocalOnly}
                style={{ cursor: 'pointer', accentColor: '#10b981' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.78rem', color: config.simulateFailure ? '#fb7185' : '#cbd5e1' }}>
              <span title="Demonstrate automatic cloud failure recovery to judges">Simulate Cloud Failure (Demo Mode)</span>
              <input
                type="checkbox"
                checked={config.simulateFailure}
                onChange={handleToggleSimulateFailure}
                style={{ cursor: 'pointer', accentColor: '#f43f5e' }}
              />
            </label>
          </div>

          {/* Status Note Footer */}
          <div style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.45rem', fontSize: '0.68rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔒 Keys strictly server-side</span>
            {lastChecked && <span>Checked: {lastChecked}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
