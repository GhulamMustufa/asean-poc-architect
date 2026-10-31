'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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

export function ModelSwitcher({ compact = false }: { compact?: boolean }) {
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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
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
    if (loadingHealth) return { label: 'Checking', color: 'var(--text-secondary)' };
    const p = health.find(h => h.providerId === providerId);
    if (!p) return { label: 'Checking', color: 'var(--text-secondary)' };
    if (p.status === 'connected') return { label: 'Connected', color: 'var(--accent-emerald)' };
    if (p.status === 'not_configured') return { label: 'Not Configured', color: 'var(--accent-amber)', note: p.errorNote };
    return { label: 'Unavailable', color: 'var(--accent-rose)', note: p.errorNote };
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
    if (config.simulateFailure) return 'var(--accent-rose)';
    if (config.localOnlyMode) return 'var(--accent-emerald)';
    if (config.preferredModelId === 'gemma-4-31b-it') return googleStatus.color;
    if (config.preferredModelId === 'llama-3.1-8b-instant') return groqStatus.color;
    if (config.preferredModelId?.startsWith('gemma2') || config.preferredModelId?.startsWith('qwen')) return ollamaStatus.color;
    return 'var(--accent-cyan)';
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
            ? '1px dashed var(--accent-rose)'
            : config.localOnlyMode
            ? (isHovered ? '1px solid var(--accent-emerald)' : '1px solid rgba(var(--rgb-blue), 0.4)')
            : (isHovered ? '1px solid rgba(var(--rgb-blue), 0.5)' : '1px solid rgba(var(--rgb-fg), 0.14)'),
          background: config.simulateFailure
            ? (isHovered ? 'rgba(var(--rgb-red), 0.2)' : 'rgba(var(--rgb-red), 0.12)')
            : config.localOnlyMode
            ? (isHovered ? 'rgba(var(--rgb-blue), 0.18)' : 'rgba(var(--rgb-blue), 0.1)')
            : (isHovered ? 'rgba(var(--rgb-fg), 0.12)' : 'rgba(var(--rgb-fg), 0.06)'),
          backdropFilter: 'blur(10px)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isHovered
            ? '0 4px 12px var(--bg-sunken), 0 0 10px rgba(var(--rgb-blue), 0.15)'
            : '0 2px 8px var(--bg-sunken)'
        }}
        title="Universal AI Gateway: Multi-Model Routing & Automatic Failover"
        aria-label={`AI model: ${getActiveDisplayLabel()}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
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
        <span style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{compact ? 'AI' : (<><span className="md:hidden">AI</span><span className="max-md:hidden">{getActiveDisplayLabel()}</span></>)}</span>
        {config.localOnlyMode && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(var(--rgb-blue), 0.2)', color: 'var(--accent-emerald)', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>
            Edge
          </span>
        )}
        {config.simulateFailure && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(var(--rgb-red), 0.25)', color: 'var(--accent-rose)', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>
            Sim Fail
          </span>
        )}
        <ChevronDown aria-hidden style={{ width: 14, height: 14, opacity: 0.7, color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s ease-out' }} />
      </button>

      {isOpen && (
        <div
          id="ai-model-switcher-panel"
          className="model-panel"
          role="dialog"
          aria-label="AI model settings"
          data-lenis-prevent
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.6rem',
            width: 'min(360px, calc(100vw - 1.5rem))',
            maxWidth: 'calc(100vw - 1.5rem)',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(var(--rgb-fg), 0.1)',
            border: '1px solid rgba(var(--rgb-fg), 0.12)',
            zIndex: 1000,
            padding: '0.9rem',
            fontSize: '0.82rem',
            color: 'var(--text-primary)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(var(--rgb-fg), 0.08)', paddingBottom: '0.5rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Universal AI Gateway</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(var(--rgb-blue), 0.15)', color: 'var(--accent-cyan)', padding: '1px 6px', borderRadius: '999px' }}>v2.4</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Multi-Model Routing & Automatic Failover</div>
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
                border: '1px solid rgba(var(--rgb-fg), 0.12)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                cursor: loadingHealth ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {loadingHealth ? 'Checking...' : '↻ Refresh Status'}
            </button>
          </div>

          {/* Model Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Select Active AI Model:
            </div>

            {/* Option 1: Automatic Routing */}
            <div
              onClick={() => handleSelectModel('auto')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'auto' ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: config.preferredModelId === 'auto' ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'auto' ? 'var(--accent-cyan)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Automatic (Recommended)</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Google Gemma ➔ Groq ➔ Ollama ➔ Cache</div>
              </div>
              <span style={{ fontSize: '0.68rem', background: 'rgba(var(--rgb-blue), 0.2)', color: 'var(--accent-cyan)', padding: '2px 7px', borderRadius: '999px', fontWeight: 600 }}>
                Cascade
              </span>
            </div>

            {/* Option 2: Google Gemma 4 */}
            <div
              onClick={() => handleSelectModel('gemma-4-31b-it')}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: config.preferredModelId === 'gemma-4-31b-it' ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: config.preferredModelId === 'gemma-4-31b-it' ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1,
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma-4-31b-it' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Google Gemma 4 (31B IT)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cloud • Deep Enterprise Reasoning Engine</div>
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
                border: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: config.localOnlyMode ? 0.45 : 1,
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: (config.preferredModelId === 'llama-3.1-8b-instant' || config.preferredModelId === 'groq-instant') ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Groq Cloud (Instant LPU)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cloud • Sub-second rapid demo generation</div>
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
                border: config.preferredModelId === 'gemma2:2b' ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: config.preferredModelId === 'gemma2:2b' ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'gemma2:2b' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Local Ollama (Gemma 2:2B)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Local Apple Silicon GPU • Air-Gap Friendly</div>
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
                border: config.preferredModelId === 'qwen2.5-coder:3b' ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: config.preferredModelId === 'qwen2.5-coder:3b' ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'qwen2.5-coder:3b' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Local Ollama (Qwen 2.5:3B)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Local Apple Silicon GPU • Schema Specialist</div>
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
                border: config.preferredModelId === 'deterministic-demo-engine' ? '1px solid var(--accent-cyan)' : '1px solid rgba(var(--rgb-fg), 0.06)',
                background: config.preferredModelId === 'deterministic-demo-engine' ? 'rgba(var(--rgb-blue), 0.15)' : 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: config.preferredModelId === 'deterministic-demo-engine' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Offline Grounded Demo Engine</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Zero Network • 100% Guaranteed Reliability</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
                Always Ready
              </span>
            </div>
          </div>

          {/* Controls & Governance Toggles */}
          <div style={{ borderTop: '1px solid rgba(var(--rgb-fg), 0.08)', paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Execution Policy & Toggles:
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <span>Automatic Failover Cascade</span>
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={handleToggleFallback}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <span title="Strictly forbids all outbound cloud calls (Google/Groq)">Local-Only Mode (Zero Cloud)</span>
              <input
                type="checkbox"
                checked={config.localOnlyMode}
                onChange={handleToggleLocalOnly}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-emerald)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.8rem', color: config.simulateFailure ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
              <span title="Demonstrate automatic cloud failure recovery to judges">Simulate Cloud Failure (Demo Mode)</span>
              <input
                type="checkbox"
                checked={config.simulateFailure}
                onChange={handleToggleSimulateFailure}
                style={{ cursor: 'pointer', accentColor: 'var(--accent-rose)' }}
              />
            </label>
          </div>

          {/* Status Note Footer */}
          <div style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(var(--rgb-fg), 0.08)', paddingTop: '0.45rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            {lastChecked && <div>Health verified: {lastChecked}</div>}
            <div style={{ fontStyle: 'italic', marginTop: '2px', color: 'var(--text-muted)' }}>
              Keys stored server-side. Zero API credentials in browser bundles.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
