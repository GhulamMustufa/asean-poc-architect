'use client';

import React, { useState } from 'react';
import { CountryFlag } from '@/components/CountryFlag';
import { PilotProposal, ProposalMilestone, ProposalKpi, RaciItem, ProposalStatus } from '@/types';
import { downloadFile, formatProposalMarkdown } from '@/lib/exportUtils';
import { downloadProposalPdf } from '@/lib/pdfExport';
import { getNextActionForStatus } from '@/lib/store';

interface ProposalWorkspaceProps {
  proposal: PilotProposal;
  onSave: (updated: PilotProposal) => void;
  onBack: () => void;
}

export function ProposalWorkspace({ proposal, onSave, onBack }: ProposalWorkspaceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Editable local state
  const [currentProposal, setCurrentProposal] = useState<PilotProposal>(proposal);

  // Human approval modal form state
  const [approverName, setApproverName] = useState(proposal.approvalRecord?.decidedBy || '');
  const [approverRole, setApproverRole] = useState(proposal.approvalRecord?.deciderRole || '');
  const [decisionNotes, setDecisionNotes] = useState(proposal.approvalRecord?.decisionNotes || '');
  const [signoffConfirmed, setSignoffConfirmed] = useState(false);

  // Rejection modal form state
  const [rejectionReason, setRejectionReason] = useState('');

  // Track field changes
  const markFieldEdited = (fieldName: string) => {
    const existing = currentProposal.editedFields || [];
    if (!existing.includes(fieldName)) {
      setCurrentProposal((prev) => ({
        ...prev,
        editedFields: [...(prev.editedFields || []), fieldName]
      }));
    }
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const updated: PilotProposal = {
      ...currentProposal,
      updatedAt: now,
      version: currentProposal.version + 1,
      editHistory: [
        ...(currentProposal.editHistory || []),
        {
          id: `edit-${Date.now().toString(36)}`,
          timestamp: now,
          editorName: 'Human Reviewer',
          fieldsEdited: currentProposal.editedFields || [],
          summaryNotes: 'User updated pilot proposal parameters.'
        }
      ]
    };
    onSave(updated);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleRevertSection = (sectionKey: 'executiveSummary' | 'inScope' | 'outOfScope' | 'milestones' | 'raciMatrix' | 'kpis') => {
    if (!currentProposal.originalGenerated) return;
    const orig = currentProposal.originalGenerated;

    setCurrentProposal((prev) => {
      const remainingFields = (prev.editedFields || []).filter((f) => f !== sectionKey);
      const updated = { ...prev, editedFields: remainingFields };

      if (sectionKey === 'executiveSummary') {
        updated.executiveSummary = orig.executiveSummary;
      } else if (sectionKey === 'inScope') {
        updated.inScope = [...orig.inScope];
      } else if (sectionKey === 'outOfScope') {
        updated.outOfScope = [...orig.outOfScope];
      } else if (sectionKey === 'milestones') {
        updated.milestones = JSON.parse(JSON.stringify(orig.milestones));
      } else if (sectionKey === 'raciMatrix') {
        updated.raciMatrix = JSON.parse(JSON.stringify(orig.raciMatrix));
      } else if (sectionKey === 'kpis') {
        updated.kpis = JSON.parse(JSON.stringify(orig.kpis));
      }
      return updated;
    });
  };

  // Status transitions
  const handleSubmitForReview = () => {
    const updated: PilotProposal = {
      ...currentProposal,
      status: 'Under Review',
      nextAction: getNextActionForStatus('Under Review'),
      updatedAt: new Date().toISOString(),
      approvalRecord: {
        status: 'Under Review',
        explicitHumanSignoff: false,
        decisionNotes: 'Submitted for enterprise steering committee review.'
      }
    };
    setCurrentProposal(updated);
    onSave(updated);
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signoffConfirmed) return;

    const now = new Date().toISOString();
    const updated: PilotProposal = {
      ...currentProposal,
      status: 'Approved',
      nextAction: getNextActionForStatus('Approved'),
      updatedAt: now,
      approvalRecord: {
        status: 'Approved',
        decidedBy: approverName.trim() || 'Enterprise Reviewer',
        deciderRole: approverRole.trim() || 'Pilot Sponsor',
        decidedAt: now,
        decisionNotes: decisionNotes.trim(),
        explicitHumanSignoff: true
      }
    };

    setCurrentProposal(updated);
    onSave(updated);
    setShowApprovalModal(false);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    const now = new Date().toISOString();
    const updated: PilotProposal = {
      ...currentProposal,
      status: 'Rejected',
      nextAction: getNextActionForStatus('Rejected'),
      updatedAt: now,
      approvalRecord: {
        status: 'Rejected',
        rejectionReason: rejectionReason.trim(),
        decidedAt: now,
        explicitHumanSignoff: true
      }
    };

    setCurrentProposal(updated);
    onSave(updated);
    setShowRejectModal(false);
  };

  const handleReopenAsDraft = () => {
    const updated: PilotProposal = {
      ...currentProposal,
      status: 'Draft',
      nextAction: getNextActionForStatus('Draft'),
      updatedAt: new Date().toISOString()
    };
    setCurrentProposal(updated);
    onSave(updated);
  };

  const handleDownloadPdf = () => {
    downloadProposalPdf(currentProposal);
  };

  const handleCopyMarkdown = () => {
    const md = formatProposalMarkdown(currentProposal);
    navigator.clipboard.writeText(md);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = formatProposalMarkdown(currentProposal);
    downloadFile(
      md,
      `${currentProposal.id}-${currentProposal.startupName.toLowerCase().replace(/\s+/g, '-')}-pilot-proposal.md`,
      'text/markdown'
    );
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(currentProposal, null, 2);
    downloadFile(jsonStr, `${currentProposal.id}-proposal.json`, 'application/json');
  };

  // Helper check for edited state
  const isFieldEdited = (fieldName: string) => currentProposal.editedFields?.includes(fieldName);

  return (
    <div className="proposal-workspace">
      {/* Top Navigation & Status Bar */}
      <div className="proposal-topbar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 280px', minWidth: 0 }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
            ← Back to Projects
          </button>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                className={`badge ${
                  currentProposal.status === 'Approved'
                    ? 'badge-approved'
                    : currentProposal.status === 'Under Review' || (currentProposal.status as any) === 'In Review'
                    ? 'badge-under-review'
                    : currentProposal.status === 'Rejected'
                    ? 'badge-rejected'
                    : 'badge-draft'
                }`}
              >
                ● {currentProposal.status}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                v{currentProposal.version}.0 • ID: {currentProposal.id}
              </span>
              {currentProposal.nextAction && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(var(--rgb-blue), 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Next: {currentProposal.nextAction}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem', wordBreak: 'break-word' }}>
              {currentProposal.challengeTitle}
            </h1>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {saveToast && (
            <span style={{ color: 'var(--accent-emerald)', fontSize: '0.825rem', fontWeight: 600 }}>
              ✓ Saved successfully
            </span>
          )}

          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setCurrentProposal(proposal);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditing(true)}
            >
              ✎ Edit Proposal
            </button>
          )}

          {/* Explicit Human Approval Controls */}
          {currentProposal.status === 'Draft' && !isEditing && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSubmitForReview}
              style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
            >
              Submit for Review →
            </button>
          )}

          {currentProposal.status === 'Under Review' && !isEditing && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                onClick={() => {
                  setSignoffConfirmed(false);
                  setShowApprovalModal(true);
                }}
              >
                ✓ Approve Proposal
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}
                onClick={() => setShowRejectModal(true)}
              >
                ✕ Request Changes
              </button>
            </>
          )}

          {(currentProposal.status === 'Approved' || currentProposal.status === 'Rejected') && !isEditing && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleReopenAsDraft}
              title="Return proposal to Draft state for revisions"
            >
              ↺ Re-open as Draft
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowExportModal(true)}
          >
            Export Proposal ↓
          </button>
        </div>
      </div>

      <div className="proposal-body">
        {/* Human Approval Status Alert Banners */}
        {currentProposal.status === 'Approved' && (
          <div
            style={{
              background: 'rgba(var(--rgb-blue), 0.08)',
              border: '1px solid rgba(var(--rgb-blue), 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-approved" style={{ fontSize: '0.8rem' }}>
                  ✓ PILOT PLAN APPROVED
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  By <strong>{currentProposal.approvalRecord?.decidedBy || 'Enterprise Sponsor'}</strong> ({currentProposal.approvalRecord?.deciderRole || 'Executive'}) on{' '}
                  {currentProposal.approvalRecord?.decidedAt
                    ? new Date(currentProposal.approvalRecord.decidedAt).toLocaleDateString()
                    : 'Verified'}
                </span>
              </div>
              {currentProposal.approvalRecord?.decisionNotes && (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  <strong>Review Notes:</strong> {currentProposal.approvalRecord.decisionNotes}
                </p>
              )}
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleDownloadPdf}>
              Download Official PDF ↓
            </button>
          </div>
        )}

        {currentProposal.status === 'Rejected' && (
          <div
            style={{
              background: 'rgba(var(--rgb-red), 0.08)',
              border: '1px solid rgba(var(--rgb-red), 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-rejected" style={{ fontSize: '0.8rem' }}>
                ✕ PILOT PLAN NOT APPROVED
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Changes needed before this can proceed.
              </span>
            </div>
            {currentProposal.approvalRecord?.rejectionReason && (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                <strong>Feedback:</strong> {currentProposal.approvalRecord.rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* Provenance & Edit Legend Banner */}
        <div className="provenance-legend no-print">
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Where this info came from:</span>
          <span className="badge badge-ai">🤖 Written by AI</span>
          <span className="badge badge-edited">✏️ Edited by Team</span>
          <span className="badge badge-verified">✅ Verified Startup Data</span>
          <span className="badge badge-supplied">🏢 Your Company Info</span>
        </div>

        {/* AI Gateway Execution Transparency Audit Indicator */}
        <div
          id="ai-execution-transparency-card"
          className="card no-print"
          style={{
            background: currentProposal.generationMetadata?.gatewayExecution?.fallbackUsed
              ? 'rgba(var(--rgb-yellow), 0.04)'
              : 'rgba(var(--rgb-blue), 0.03)',
            border: currentProposal.generationMetadata?.gatewayExecution?.fallbackUsed
              ? '1px solid rgba(var(--rgb-yellow), 0.25)'
              : '1px solid rgba(var(--rgb-blue), 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            marginBottom: '1rem',
            fontSize: '0.825rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentProposal.generationMetadata?.gatewayExecution?.fallbackUsed ? 'var(--accent-amber)' : 'var(--accent-emerald)', display: 'inline-block' }} />
                AI Gateway Execution Audit
              </span>
              {currentProposal.generationMetadata?.gatewayExecution?.isCachedResult && (
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 600 }}>
                  Cached Demo Result
                </span>
              )}
              {currentProposal.generationMetadata?.gatewayExecution?.localOnlyEnforced && (
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>
                  Local Edge Only (Air-Gap Safe)
                </span>
              )}
              {currentProposal.generationMetadata?.gatewayExecution?.actualProviderId === 'fallback' && (
                <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem', fontWeight: 600 }}>
                  Deterministic Demo Engine
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
              Completed: {currentProposal.generationMetadata?.completedAt ? new Date(currentProposal.generationMetadata.completedAt).toLocaleTimeString() : new Date(currentProposal.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Selected Model</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentProposal.generationMetadata?.gatewayExecution?.requestedModelId || currentProposal.generationMetadata?.provider || 'Automatic Cascade'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actual Provider Used</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentProposal.generationMetadata?.gatewayExecution?.actualProviderName || currentProposal.generationMetadata?.provider || 'Google Gemma'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actual Model Identifier</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {currentProposal.generationMetadata?.gatewayExecution?.actualModelId || currentProposal.generationMetadata?.modelName || 'gemma-4-31b-it'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Measured Latency</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentProposal.generationMetadata?.latencyMs ?? 180}ms
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cascade Fallback Triggered</div>
              <div style={{ fontWeight: 600, color: currentProposal.generationMetadata?.usedFallback ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                {currentProposal.generationMetadata?.usedFallback ? 'Yes (Auto Recovered)' : 'No (Direct Primary Execution)'}
              </div>
            </div>
          </div>

          {currentProposal.generationMetadata?.usedFallback && currentProposal.generationMetadata?.errorNote && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(var(--rgb-yellow), 0.3)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Failover Cascade Rationale:</strong> {currentProposal.generationMetadata.errorNote}
            </div>
          )}
        </div>

        {/* Executive Header Box */}
        <div className="card" style={{ background: 'rgba(var(--rgb-fg), 0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <span className="badge badge-supplied" style={{ marginBottom: '0.35rem' }}>Your Company</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{currentProposal.enterpriseName}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Project Owner</span>
            </div>
            <div>
              <span className="badge badge-verified" style={{ marginBottom: '0.35rem' }}>Matched Tech Startup</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {currentProposal.startupName} <CountryFlag code={currentProposal.startupCountry} />
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Solution Provider</span>
            </div>
            <div>
              <span className="badge badge-ai" style={{ marginBottom: '0.35rem' }}>Project Length</span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {currentProposal.milestones.reduce((acc, m) => acc + m.durationWeeks, 0)} Weeks
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trial Project</span>
            </div>
          </div>
        </div>

        {/* Visual 3-Stage Progress Stepper - Glanceable Timeline */}
        <div className="stepper-container no-print" style={{ marginTop: '1.5rem' }}>
          <div className="stepper-step active">
            <span className="stepper-step-num">Stage 1 (Weeks 1–2)</span>
            <span className="stepper-step-title">Safe Sandbox Setup</span>
            <span className="stepper-step-desc">VPC peering & zero-PII data anonymization validation.</span>
          </div>
          <div className="stepper-step active">
            <span className="stepper-step-num">Stage 2 (Weeks 3–6)</span>
            <span className="stepper-step-title">Shadow Benchmark</span>
            <span className="stepper-step-desc">Real-time alert testing on 120k daily txns. Zero live DB writes.</span>
          </div>
          <div className="stepper-step">
            <span className="stepper-step-num">Stage 3 (Weeks 7–8)</span>
            <span className="stepper-step-title">Executive Review</span>
            <span className="stepper-step-desc">Compliance co-sign & final business case for commercial contract.</span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>1. Project Overview & Summary</span>
              {isFieldEdited('executiveSummary') ? (
                <span className="badge badge-edited">✏️ [EDITED]</span>
              ) : (
                <span className="badge badge-ai">🤖 [AI DRAFT]</span>
              )}
            </h2>
            {isFieldEdited('executiveSummary') && (
              <button
                type="button"
                className="btn btn-outline btn-sm no-print"
                onClick={() => handleRevertSection('executiveSummary')}
                title="Restore original AI generated content"
              >
                ↺ Reset to AI Draft
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              className="form-textarea"
              style={{ minHeight: '130px' }}
              value={currentProposal.executiveSummary}
              onChange={(e) => {
                markFieldEdited('executiveSummary');
                setCurrentProposal({ ...currentProposal, executiveSummary: e.target.value });
              }}
            />
          ) : (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              {currentProposal.executiveSummary}
            </p>
          )}
        </section>

        {/* Section 2: Problem Statement & Proposed Solution */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>2. The Problem & How We Will Solve It</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-supplied">🏢 [YOUR COMPANY]</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>What Needs to Be Solved</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentProposal.problemStatement}
              </p>
            </div>

            <div style={{ background: 'var(--bg-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-ai">🤖 [AI SUGGESTION]</span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>How the Startup Will Help</h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentProposal.proposedSolution}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Scope & Integration Boundaries */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>3. What We Will Do (And What We Won't Do)</span>
              {isFieldEdited('inScope') || isFieldEdited('outOfScope') ? (
                <span className="badge badge-edited">✏️ [EDITED]</span>
              ) : (
                <span className="badge badge-ai">🤖 [AI DRAFT]</span>
              )}
            </h2>
            {(isFieldEdited('inScope') || isFieldEdited('outOfScope')) && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isFieldEdited('inScope') && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm no-print"
                    onClick={() => handleRevertSection('inScope')}
                  >
                    ↺ Reset In-Scope
                  </button>
                )}
                {isFieldEdited('outOfScope') && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm no-print"
                    onClick={() => handleRevertSection('outOfScope')}
                  >
                    ↺ Reset Out-of-Scope
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
            {/* In-Scope */}
            <div style={{ background: 'rgba(var(--rgb-blue), 0.05)', border: '1px solid rgba(var(--rgb-blue), 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', margin: 0 }}>
                  ✓ In-Scope (What We WILL Do)
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      markFieldEdited('inScope');
                      setCurrentProposal({
                        ...currentProposal,
                        inScope: [...currentProposal.inScope, 'New in-scope activity']
                      });
                    }}
                  >
                    + Add Item
                  </button>
                )}
              </div>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {currentProposal.inScope.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--accent-emerald)' }}>▸</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.3rem', width: '100%' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                          value={item}
                          onChange={(e) => {
                            markFieldEdited('inScope');
                            const updated = [...currentProposal.inScope];
                            updated[idx] = e.target.value;
                            setCurrentProposal({ ...currentProposal, inScope: updated });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.2rem 0.4rem', color: 'var(--accent-rose)' }}
                          onClick={() => {
                            markFieldEdited('inScope');
                            const updated = currentProposal.inScope.filter((_, i) => i !== idx);
                            setCurrentProposal({ ...currentProposal, inScope: updated });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Out-of-Scope */}
            <div style={{ background: 'rgba(var(--rgb-red), 0.05)', border: '1px solid rgba(var(--rgb-red), 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-rose)', margin: 0 }}>
                  ✕ Out-of-Scope (What We WILL NOT Do)
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => {
                      markFieldEdited('outOfScope');
                      setCurrentProposal({
                        ...currentProposal,
                        outOfScope: [...currentProposal.outOfScope, 'New out-of-scope exclusion']
                      });
                    }}
                  >
                    + Add Item
                  </button>
                )}
              </div>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                {currentProposal.outOfScope.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--accent-rose)' }}>▸</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.3rem', width: '100%' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                          value={item}
                          onChange={(e) => {
                            markFieldEdited('outOfScope');
                            const updated = [...currentProposal.outOfScope];
                            updated[idx] = e.target.value;
                            setCurrentProposal({ ...currentProposal, outOfScope: updated });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.2rem 0.4rem', color: 'var(--accent-rose)' }}
                          onClick={() => {
                            markFieldEdited('outOfScope');
                            const updated = currentProposal.outOfScope.filter((_, i) => i !== idx);
                            setCurrentProposal({ ...currentProposal, outOfScope: updated });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--bg-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--accent-cyan)' }}>System Connection & Data Safety: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{currentProposal.integrationArchitecture}</span>
          </div>
        </section>

        {/* Executive KPI Stat Banner - Glanceable Metrics */}
        <div className="kpi-banner no-print">
          <div>
            <div className="kpi-stat-num">-40%</div>
            <div className="kpi-stat-label">Target Alert Volume Reduction</div>
          </div>
          <div>
            <div className="kpi-stat-num">100%</div>
            <div className="kpi-stat-label">AML Typology Recall Preserved</div>
          </div>
          <div>
            <div className="kpi-stat-num">&lt;180ms</div>
            <div className="kpi-stat-label">Decision Latency SLA Target</div>
          </div>
          <div>
            <div className="kpi-stat-num">Zero</div>
            <div className="kpi-stat-label">Live DB Modification Risk</div>
          </div>
        </div>

        {/* Section 4: Milestones & Schedule */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>4. Project Timeline & Steps (60-Day Plan)</span>
              {isFieldEdited('milestones') ? (
                <span className="badge badge-edited">✏️ [EDITED]</span>
              ) : (
                <span className="badge badge-ai">🤖 [AI DRAFT]</span>
              )}
            </h2>
            {isFieldEdited('milestones') && (
              <button
                type="button"
                className="btn btn-outline btn-sm no-print"
                onClick={() => handleRevertSection('milestones')}
              >
                ↺ Reset Timeline
              </button>
            )}
          </div>

          <div className="milestones-list">
            {currentProposal.milestones.map((m, idx) => (
              <div key={m.id} className="milestone-item">
                <div className="milestone-header">
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                        {m.phase}
                      </span>
                      {(m as any).dayRange && (
                        <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>
                          ⏱ {(m as any).dayRange}
                        </span>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontWeight: 700, margin: '0.3rem 0' }}
                        value={m.title}
                        onChange={(e) => {
                          markFieldEdited('milestones');
                          const updated = [...currentProposal.milestones];
                          updated[idx].title = e.target.value;
                          setCurrentProposal({ ...currentProposal, milestones: updated });
                        }}
                      />
                    ) : (
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.1rem' }}>
                        {idx + 1}. {m.title}
                      </h3>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          className="form-input"
                          style={{ width: '60px', padding: '0.25rem 0.4rem', fontSize: '0.8rem' }}
                          value={m.durationWeeks}
                          onChange={(e) => {
                            markFieldEdited('milestones');
                            const updated = [...currentProposal.milestones];
                            updated[idx].durationWeeks = Number(e.target.value) || 1;
                            setCurrentProposal({ ...currentProposal, milestones: updated });
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wks</span>
                      </div>
                    ) : (
                      <span className="badge badge-country">
                        {m.durationWeeks} Weeks
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ margin: '0.5rem 0' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key Deliverables:</strong>
                  <ul className="milestone-deliverables" style={{ marginTop: '0.3rem' }}>
                    {m.deliverables.map((d, dIdx) => (
                      <li key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem' }}
                            value={d}
                            onChange={(e) => {
                              markFieldEdited('milestones');
                              const updatedMilestones = [...currentProposal.milestones];
                              updatedMilestones[idx].deliverables[dIdx] = e.target.value;
                              setCurrentProposal({ ...currentProposal, milestones: updatedMilestones });
                            }}
                          />
                        ) : (
                          <span>{d}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                  <strong style={{ color: 'var(--accent-emerald)' }}>Check Before Moving to Next Step: </strong>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: '0.35rem' }}
                      value={m.acceptanceCriteria}
                      onChange={(e) => {
                        markFieldEdited('milestones');
                        const updatedMilestones = [...currentProposal.milestones];
                        updatedMilestones[idx].acceptanceCriteria = e.target.value;
                        setCurrentProposal({ ...currentProposal, milestones: updatedMilestones });
                      }}
                    />
                  ) : (
                    <span>{m.acceptanceCriteria}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Responsibilities (RACI Matrix) */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>5. Who Does What (Team Roles & Responsibilities)</span>
              {isFieldEdited('raciMatrix') ? (
                <span className="badge badge-edited">✏️ [EDITED]</span>
              ) : (
                <span className="badge badge-ai">🤖 [AI DRAFT]</span>
              )}
            </h2>
            {isFieldEdited('raciMatrix') && (
              <button
                type="button"
                className="btn btn-outline btn-sm no-print"
                onClick={() => handleRevertSection('raciMatrix')}
              >
                ↺ Reset Roles
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="raci-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Task or Deliverable</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>Your Company's Role</th>
                  <th style={{ width: '18%', textAlign: 'center' }}>Startup's Role</th>
                  <th style={{ width: '24%' }}>Details & Notes</th>
                </tr>
              </thead>
              <tbody>
                {currentProposal.raciMatrix.map((r, rIdx) => (
                  <tr key={r.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.4rem' }}
                          value={r.activity}
                          onChange={(e) => {
                            markFieldEdited('raciMatrix');
                            const updated = [...currentProposal.raciMatrix];
                            updated[rIdx].activity = e.target.value;
                            setCurrentProposal({ ...currentProposal, raciMatrix: updated });
                          }}
                        />
                      ) : (
                        <strong>{r.activity}</strong>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.2rem' }}
                          value={r.enterpriseRole}
                          onChange={(e) => {
                            markFieldEdited('raciMatrix');
                            const updated = [...currentProposal.raciMatrix];
                            updated[rIdx].enterpriseRole = e.target.value as any;
                            setCurrentProposal({ ...currentProposal, raciMatrix: updated });
                          }}
                        >
                          <option value="Responsible">Responsible (Does the work)</option>
                          <option value="Accountable">Accountable (Final approver)</option>
                          <option value="Consulted">Consulted (Gives input)</option>
                          <option value="Informed">Informed (Kept updated)</option>
                        </select>
                      ) : (
                        <span className={`raci-tag ${r.enterpriseRole[0]}`}>{r.enterpriseRole}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <select
                          className="form-select"
                          style={{ fontSize: '0.75rem', padding: '0.2rem' }}
                          value={r.startupRole}
                          onChange={(e) => {
                            markFieldEdited('raciMatrix');
                            const updated = [...currentProposal.raciMatrix];
                            updated[rIdx].startupRole = e.target.value as any;
                            setCurrentProposal({ ...currentProposal, raciMatrix: updated });
                          }}
                        >
                          <option value="Responsible">Responsible (Does the work)</option>
                          <option value="Accountable">Accountable (Final approver)</option>
                          <option value="Consulted">Consulted (Gives input)</option>
                          <option value="Informed">Informed (Kept updated)</option>
                        </select>
                      ) : (
                        <span className={`raci-tag ${r.startupRole[0]}`}>{r.startupRole}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.4rem' }}
                          value={r.notes}
                          onChange={(e) => {
                            markFieldEdited('raciMatrix');
                            const updated = [...currentProposal.raciMatrix];
                            updated[rIdx].notes = e.target.value;
                            setCurrentProposal({ ...currentProposal, raciMatrix: updated });
                          }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.notes}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6: Target KPIs & Measurement Framework */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>6. How We Measure Success (Goals & KPIs)</span>
              {isFieldEdited('kpis') ? (
                <span className="badge badge-edited">✏️ [EDITED]</span>
              ) : (
                <span className="badge badge-ai">🤖 [AI DRAFT]</span>
              )}
            </h2>
            {isFieldEdited('kpis') && (
              <button
                type="button"
                className="btn btn-outline btn-sm no-print"
                onClick={() => handleRevertSection('kpis')}
              >
                ↺ Reset Goals
              </button>
            )}
          </div>

          <div style={{ background: 'rgba(var(--rgb-blue), 0.06)', border: '1px solid rgba(var(--rgb-blue), 0.2)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
            ℹ <strong>Helpful Note:</strong> These target numbers are starting estimates to test during the trial. Actual numbers will be confirmed in the first two weeks of the project.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {currentProposal.kpis.map((kpi, kIdx) => (
              <div key={kpi.id} style={{ background: 'rgba(var(--rgb-fg), 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Goal #{kIdx + 1}
                  </span>
                  <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>
                    Target Estimate
                  </span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontWeight: 700, margin: '0.35rem 0' }}
                    value={kpi.metric}
                    onChange={(e) => {
                      markFieldEdited('kpis');
                      const updated = [...currentProposal.kpis];
                      updated[kIdx].metric = e.target.value;
                      setCurrentProposal({ ...currentProposal, kpis: updated });
                    }}
                  />
                ) : (
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0 0.5rem 0' }}>
                    {kpi.metric}
                  </h3>
                )}

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <strong>Where you are today (Baseline):</strong>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', marginTop: '0.1rem' }}
                      value={kpi.baseline}
                      onChange={(e) => {
                        markFieldEdited('kpis');
                        const updated = [...currentProposal.kpis];
                        updated[kIdx].baseline = e.target.value;
                        setCurrentProposal({ ...currentProposal, kpis: updated });
                      }}
                    />
                  ) : (
                    <span>{kpi.baseline}</span>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <strong>Goal to reach (Target):</strong>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.2rem 0.4rem', marginTop: '0.1rem' }}
                      value={kpi.target}
                      onChange={(e) => {
                        markFieldEdited('kpis');
                        const updated = [...currentProposal.kpis];
                        updated[kIdx].target = e.target.value;
                        setCurrentProposal({ ...currentProposal, kpis: updated });
                      }}
                    />
                  ) : (
                    <span>{kpi.target}</span>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <div>
                    <strong>How We Measure It:</strong>{' '}
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-input"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', marginTop: '0.1rem' }}
                        value={kpi.measurementMethod}
                        onChange={(e) => {
                          markFieldEdited('kpis');
                          const updated = [...currentProposal.kpis];
                          updated[kIdx].measurementMethod = e.target.value;
                          setCurrentProposal({ ...currentProposal, kpis: updated });
                        }}
                      />
                    ) : (
                      <span>{kpi.measurementMethod}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Risks, Governance & Legal */}
        <section className="proposal-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>7. Potential Risks & Safety Measures</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Risks & How We Prevent Them
              </h3>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {currentProposal.technicalRisks.map((r, rIdx) => (
                  <li key={rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--accent-amber)' }}>⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'var(--bg-sunken)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-verified">✅ [CONFIRMED]</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Where Data Will Be Stored</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {currentProposal.dataResidencyPlan}
              </p>
            </div>
          </div>

          {/* Legal Advisory Disclaimer */}
          <div className="legal-box">
            <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', color: 'var(--accent-amber)' }}>
              ⚖ Important Notice & Legal Disclaimer
            </div>
            <div>{currentProposal.legalDisclaimer}</div>
          </div>
        </section>
      </div>

      {/* Human Approval Modal */}
      {showApprovalModal && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Approve Pilot Plan</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowApprovalModal(false)}>
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(var(--rgb-yellow), 0.08)', border: '1px solid rgba(var(--rgb-yellow), 0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
              🔒 <strong>Human Approval Required:</strong> By approving, you confirm that your team has reviewed this project plan and is ready to proceed.
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                *Note: The platform does not automatically send emails or sign legal contracts. Formal agreements should follow your company's normal process.
              </p>
            </div>

            <form onSubmit={handleConfirmApproval}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label" htmlFor="approverName">
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    id="approverName"
                    type="text"
                    required
                    placeholder="e.g., Sarah Lin"
                    className="form-input"
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="approverRole">
                    <span>Your Job Title / Department *</span>
                  </label>
                  <input
                    id="approverRole"
                    type="text"
                    required
                    placeholder="e.g., Head of Innovation / Department Lead"
                    className="form-input"
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="decisionNotes">
                    <span>Approval Notes or Conditions (Optional)</span>
                  </label>
                  <textarea
                    id="decisionNotes"
                    placeholder="e.g., Approved to begin Phase 1 setup once IT security has reviewed the network access."
                    className="form-textarea"
                    style={{ minHeight: '70px' }}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      required
                      style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                      checked={signoffConfirmed}
                      onChange={(e) => setSignoffConfirmed(e.target.checked)}
                    />
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      I confirm that I have reviewed this pilot plan and approve moving forward.
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                  disabled={!signoffConfirmed || !approverName.trim() || !approverRole.trim()}
                >
                  Approve This Pilot Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposal Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Request Changes / Decline Plan</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowRejectModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Explain what needs to be changed before this project can move forward.
            </p>

            <form onSubmit={handleConfirmRejection}>
              <div>
                <label className="form-label" htmlFor="rejectionReason">
                  <span>What Needs to Be Changed? *</span>
                </label>
                <textarea
                  id="rejectionReason"
                  required
                  placeholder="e.g., The project budget is higher than our Q4 allocation; please shorten Phase 2 by two weeks."
                  className="form-textarea"
                  style={{ minHeight: '90px' }}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
                  disabled={!rejectionReason.trim()}
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Download & Export Pilot Plan</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowExportModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Download a ready-to-share document with clear formatting, milestone timelines, and review notices.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* PDF Export Option */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--rgb-blue), 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--rgb-blue), 0.3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>Official PDF Document (.pdf)</h3>
                    <span className="badge badge-country" style={{ fontSize: '0.65rem' }}>Recommended</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Clean, professional PDF labeled: <em>"Draft Pilot Proposal — Subject to Business, Technical and Legal Review."</em>
                  </p>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleDownloadPdf}>
                  Download PDF ↓
                </button>
              </div>

              {/* Markdown Option */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--rgb-fg), 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Markdown Text (.md)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Readable formatted text file with easy-to-read tables.</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleExportMarkdown}>
                  Download .md
                </button>
              </div>

              {/* JSON Option */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--rgb-fg), 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Raw Data File (.json)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Structured file for software developers and system integrations.</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleExportJson}>
                  Download .json
                </button>
              </div>

              {/* Copy to Clipboard */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--rgb-fg), 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Copy to Clipboard</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Copy the entire proposal text to your clipboard.</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyMarkdown}>
                  {copyFeedback ? '✓ Copied!' : 'Copy Text'}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
