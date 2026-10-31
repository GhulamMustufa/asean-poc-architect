'use client';

import React, { useState } from 'react';
import { ASEANCountry, EnterpriseChallenge, IndustryVertical } from '@/types';

interface ChallengeFormProps {
  onSubmit: (challenge: EnterpriseChallenge) => void;
  onCancel: () => void;
}

const PRESET_SCENARIOS: {
  label: string;
  isRealWorld?: boolean;
  sourceNote?: string;
  data: Omit<EnterpriseChallenge, 'id' | 'createdAt'>;
}[] = [
  {
    label: '🌟 [REAL IMDA OIP] PSA Singapore — Port Turnaround Analytics (SG)',
    isRealWorld: true,
    sourceNote: 'IMDA Open Innovation Platform (Singapore)',
    data: {
      title: 'Predictive Quay Crane and Vessel Turnaround Analytics',
      enterpriseName: 'PSA Corporation Limited',
      industry: 'Logistics & Supply Chain',
      country: 'SG',
      problemDescription: 'Container vessels experience unpredictable quay crane waiting times during monsoon peak traffic in the Singapore Strait. Terminal planners require predictive vessel turnaround and berth allocation analytics to optimize crane moves per hour and reduce vessel carbon emissions during berth idle.',
      desiredOutcome: 'Deploy predictive AIS and crane telemetry models to achieve a 15% reduction in container vessel dwell time and improve berth scheduling accuracy by 25%.',
      technicalRequirements: [
        'Port Vessel Turnaround Analytics',
        'AIS Satellite Vessel Telemetry Ingestion',
        'Berth Allocation & Quay Crane Scheduling Optimization',
        'Maritime GHG Emission Tracking (Scope 1 & 2)'
      ],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'Must ingest real-time AIS vessel telemetry and terminal operating system (TOS) EDI messages via secure HTTPS API with local Singapore data residency (AWS ap-southeast-1).',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$40,000 - $75,000 (IMDA OIP Grant Co-funded)',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '🌟 [REAL BNM SANDBOX] Maybank — Real-time Mule & Fraud Detection (MY)',
    isRealWorld: true,
    sourceNote: 'Bank Negara Malaysia FinTech Sandbox / Maybank Compliance',
    data: {
      title: 'AI-Assisted Transaction Fraud Surveillance & AML Alert Triage Sandbox',
      enterpriseName: 'Malayan Banking Berhad (Maybank)',
      industry: 'FinTech & Payments',
      country: 'MY',
      problemDescription: 'Cross-border digital remittance and instant retail payments generate high volumes of false-positive compliance alerts (exceeding 80%), overwhelming compliance investigators and slowing down legitimate customer payments while sophisticated money mule rings evade static rule engines.',
      desiredOutcome: 'Implement an explainable machine learning typology detection engine in a shadow production sandbox to reduce false-positive alerts by at least 40% while identifying high-risk mule account clusters within 15 minutes of first transaction.',
      technicalRequirements: ['Real-time Transaction Monitoring', 'Anti-Money Laundering (AML) Screening', 'Typology Graph Anomaly Scoring', 'Explainable Suspicion Rationale'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Read-only Kafka consumer group streaming with mTLS in dedicated VPC; strict adherence to Bank Negara Malaysia (BNM) RMIT guidelines; zero live database modification.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$50,000 - $90,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '🌟 [REAL BUMN PILOT] Indofood — Cold-Chain Telematics & e-POD (ID)',
    isRealWorld: true,
    sourceNote: 'Indonesia BUMN Supply Chain Forum / HUB.ID Komdigi',
    data: {
      title: 'End-to-End Cold-Chain Fleet Telematics & Temperature SLA Tracking',
      enterpriseName: 'PT Indofood CBP Sukses Makmur',
      industry: 'Logistics & Supply Chain',
      country: 'ID',
      problemDescription: 'Perishable dairy and frozen food shipments across inter-island Java and Sumatra logistics corridors suffer sporadic spoilage due to undetected reefer container compressor failures and unauthorized driver route detours.',
      desiredOutcome: 'Equip long-haul refrigerated fleets with real-time IoT temperature sensors and automated electronic proof-of-delivery (e-POD) to achieve zero temperature excursion spoilage across pilot transport corridors.',
      technicalRequirements: ['Real-time GPS / IoT Telematics', 'Cold-Chain Temperature Tracking', 'Proof of Delivery (e-POD)', 'Dynamic Fleet Dispatch'],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Integration via REST webhooks into corporate SAP Transport Management module; offline buffering for 12+ hour maritime dead zones.',
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$30,000 - $55,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '🌟 [REAL SUNWAY ILABS] Sunway Group — Smart Estate IoT Sub-metering (MY)',
    isRealWorld: true,
    sourceNote: 'Sunway iLabs Corporate Innovation Accelerator',
    data: {
      title: 'Smart Estate IoT Sub-metering & Energy Optimization',
      enterpriseName: 'Sunway Group',
      industry: 'Industrial IoT & Energy',
      country: 'MY',
      problemDescription: 'Commercial properties and retail facilities face rising utility tariffs and manual billing overhead from thousands of tenant electricity and water meters, preventing real-time carbon tracking and ESG compliance reporting.',
      desiredOutcome: 'Deploy automated IoT digital sub-metering with cloud billing and HVAC chiller plant optimization to achieve 12% energy reduction and automate tenant billing.',
      technicalRequirements: [
        'IoT Smart Water & Electricity Meter Telemetry',
        'Building Automation System (BAS) Integration',
        'Automated Rental Invoice & Receipt Generation',
        'Digital Twin Asset Cloud Telemetry'
      ],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Must interface with existing BACnet and Modbus building management controllers and export energy data to Sunway sustainability cloud.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$35,000 - $65,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '🏦 Malaysian Commercial Bank (Fictional Demo Benchmark)',
    isRealWorld: false,
    sourceNote: 'Synthetic Benchmark Control',
    data: {
      title: 'AI-Assisted Transaction Fraud Surveillance & AML Alert Triage Sandbox',
      enterpriseName: 'Malayan Commercial Bank Berhad (Fictional Demo)',
      industry: 'FinTech & Payments',
      country: 'MY',
      problemDescription: 'High false-positive transaction alert volume (84%) from legacy rule engines is overwhelming compliance investigation teams across Malaysia and regional remittance corridors, driving manual investigation backlogs and delayed alert resolution.',
      desiredOutcome: 'Deploy explainable ML anomaly scoring in a shadow sandbox to cut manual investigation time by 40% while preserving 100% recall on verified fraud and AML typologies.',
      technicalRequirements: ['Real-time Transaction Monitoring', 'Anti-Money Laundering (AML) Screening', 'Typology Graph Anomaly Scoring', 'Explainable Suspicion Rationale'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Read-only Kafka consumer group streaming with mTLS in dedicated VPC; strict adherence to Bank Negara Malaysia (BNM) RMIT guidelines; zero live database modification.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$35,000 - $60,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '🚚 Cold-Chain IoT Visibility (Logistics / ID)',
    data: {
      title: 'Inter-Island Maritime Reefer Telematics & Temperature Compliance Monitoring',
      enterpriseName: 'Nusantara Agro-Cold Logistics',
      industry: 'Logistics & Supply Chain',
      country: 'ID',
      problemDescription: 'Frequent cargo spoilage and missing proof-of-delivery receipts during multi-day roll-on/roll-off ferry crossings between Java and Sulawesi islands.',
      desiredOutcome: 'Equip 25 refrigerated trucks with offline-buffering cellular IoT temperature trackers to achieve automated exception alerts and digital e-POD verification.',
      technicalRequirements: ['Real-time GPS / IoT Telematics', 'Cold-Chain Temperature Tracking', 'Proof of Delivery (e-POD)', 'Dynamic Fleet Dispatch'],
      dataSensitivity: 'Internal',
      integrationConstraints: 'Integration via REST webhooks into corporate SAP Transport Management module; offline buffering for 12+ hour maritime dead zones.',
      expectedDurationWeeks: 6,
      budgetRangeUSD: '$20,000 - $40,000',
      requiresLocalDataResidency: true
    }
  },
  {
    label: '📑 Multi-lingual ERP Invoice Extraction (Enterprise AI / MY)',
    data: {
      title: 'Automated 3-Way Cross-Border Supplier Invoice Ingestion into Enterprise SAP ERP',
      enterpriseName: 'Borneo Industrial Conglomerate',
      industry: 'Enterprise AI & Cybersecurity',
      country: 'MY',
      problemDescription: 'Accounts Payable teams spend over 400 hours monthly manually keying multi-currency invoices in Malay, English, and Vietnamese into legacy SAP ERP systems.',
      desiredOutcome: 'Automate document ingestion with over 98% field extraction accuracy and automated 3-way purchase order reconciliation.',
      technicalRequirements: ['Multi-lingual OCR (EN, ID, VN, TH)', 'Automated 3-Way Invoice Matching', 'SAP / NetSuite Direct Connectors', 'Tax & GST/VAT Validation'],
      dataSensitivity: 'Confidential',
      integrationConstraints: 'Must run in dedicated regional VPC with immutable audit trail lineage for external tax authority compliance.',
      expectedDurationWeeks: 8,
      budgetRangeUSD: '$25,000 - $50,000',
      requiresLocalDataResidency: false
    }
  },
  {
    label: '🏥 Hospital Insurance Claims Bridge (Healthcare / TH)',
    data: {
      title: 'Automated Outpatient Insurance Pre-Authorization & Direct TPA Claims Clearing',
      enterpriseName: 'Siam Regional Medical Network',
      industry: 'Healthcare & MedTech',
      country: 'TH',
      problemDescription: 'Manual insurance pre-authorization delays patient discharge by up to 3 hours, causing outpatient bed bottlenecks and administrative overhead.',
      desiredOutcome: 'Bridge Hospital Information System (HIS) with private insurer TPA endpoints for instant electronic eligibility checks and cashless settlement.',
      technicalRequirements: ['Hospital Information System (HIS) API Bridge', 'Direct Insurance TPA Claims Clearing', 'Electronic Health Record (EHR) Pseudonymization'],
      dataSensitivity: 'Highly Restricted (PDPA/Banking Secret)',
      integrationConstraints: 'Strict compliance with Thailand PDPA and HIPAA pseudonymization standards; zero storage of raw patient clinical notes on third-party servers.',
      expectedDurationWeeks: 10,
      budgetRangeUSD: '$40,000 - $75,000',
      requiresLocalDataResidency: true
    }
  }
];

import { checkForDuplicateChallenge, saveChallenge } from '@/lib/store';

export function ChallengeForm({ onSubmit, onCancel }: ChallengeFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    enterpriseName: '',
    industry: 'FinTech & Payments' as IndustryVertical,
    country: 'SG' as ASEANCountry,
    problemDescription: '',
    desiredOutcome: '',
    technicalRequirementsText: '',
    dataSensitivity: 'Confidential' as EnterpriseChallenge['dataSensitivity'],
    integrationConstraints: '',
    expectedDurationWeeks: 8,
    budgetRangeUSD: '$30,000 - $50,000',
    requiresLocalDataResidency: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<EnterpriseChallenge | null>(null);

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setFormData({
      ...preset.data,
      technicalRequirementsText: preset.data.technicalRequirements.join(', ')
    });
    setDuplicateWarning(null);
  };

  const processSubmission = () => {
    setIsSubmitting(true);
    const technicalRequirements = formData.technicalRequirementsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const challenge: EnterpriseChallenge = {
      id: `chal-${Date.now().toString(36)}`,
      title: formData.title.trim(),
      enterpriseName: formData.enterpriseName.trim(),
      industry: formData.industry,
      country: formData.country,
      problemDescription: formData.problemDescription.trim(),
      desiredOutcome: formData.desiredOutcome.trim(),
      technicalRequirements: technicalRequirements.length > 0 ? technicalRequirements : ['Core API Integration', 'Data Security Compliance'],
      dataSensitivity: formData.dataSensitivity,
      integrationConstraints: formData.integrationConstraints || 'Standard HTTPS REST API with mutual TLS.',
      expectedDurationWeeks: Number(formData.expectedDurationWeeks) || 8,
      budgetRangeUSD: formData.budgetRangeUSD,
      requiresLocalDataResidency: formData.requiresLocalDataResidency,
      createdAt: new Date().toISOString()
    };

    // Save challenge to storage for persistence and deal tracking
    saveChallenge(challenge);

    setTimeout(() => {
      onSubmit(challenge);
      setIsSubmitting(false);
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate challenge submission
    if (!duplicateWarning) {
      const dupCheck = checkForDuplicateChallenge({
        enterpriseName: formData.enterpriseName,
        title: formData.title
      });

      if (dupCheck.isDuplicate && dupCheck.existingChallenge) {
        setDuplicateWarning(dupCheck.existingChallenge);
        return;
      }
    }

    processSubmission();
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Tell Us About Your Business Problem</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Describe what you want to solve so we can match you with the right tech startup.
            </p>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      {/* Quick 1-Click Demo Scenarios */}
      <div className="preset-bar">
        <span className="preset-title">⚡ Try a Real-World Challenge (Click to Fill):</span>
        {PRESET_SCENARIOS.map((p, i) => (
          <button
            key={i}
            type="button"
            className="preset-btn"
            onClick={() => handleApplyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Duplicate Submission Warning */}
      {duplicateWarning && (
        <div style={{ background: 'rgba(var(--rgb-yellow), 0.1)', border: '1px solid rgba(var(--rgb-yellow), 0.35)', borderRadius: 'var(--radius-md)', padding: '1rem', margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>⚠ A PROJECT WITH THIS NAME ALREADY EXISTS</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
              A project for <strong>{duplicateWarning.enterpriseName}</strong> called <em>&ldquo;{duplicateWarning.title}&rdquo;</em> is already saved.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setDuplicateWarning(null)}
            >
              Edit Form
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={processSubmission}
            >
              Proceed Anyway →
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Challenge Title */}
          <div className="form-group form-col-full">
            <label className="form-label" htmlFor="title">
              <span>Project Title *</span>
              <span className="form-hint">A short name for what you want to achieve</span>
            </label>
            <input
              id="title"
              type="text"
              required
              minLength={10}
              placeholder="e.g., Real-time Fraud Detection & Alert Assistant"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="form-error-msg">Please enter a project title (at least 10 characters).</div>
          </div>

          {/* Enterprise Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="enterpriseName">
              <span>Your Company Name *</span>
            </label>
            <input
              id="enterpriseName"
              type="text"
              required
              placeholder="e.g., Maybank Digital Banking"
              className="form-input"
              value={formData.enterpriseName}
              onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
            />
            <div className="form-error-msg">Company name is required.</div>
          </div>

          {/* Industry Vertical */}
          <div className="form-group">
            <label className="form-label" htmlFor="industry">
              <span>Your Industry *</span>
            </label>
            <select
              id="industry"
              className="form-select"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryVertical })}
            >
              <option value="FinTech & Payments">FinTech & Payments</option>
              <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
              <option value="AgriFood & ClimateTech">AgriFood & ClimateTech</option>
              <option value="Healthcare & MedTech">Healthcare & MedTech</option>
              <option value="Retail & E-commerce">Retail & E-commerce</option>
              <option value="Enterprise AI & Cybersecurity">Enterprise AI & Cybersecurity</option>
              <option value="Industrial IoT & Energy">Industrial IoT & Energy</option>
            </select>
          </div>

          {/* Country */}
          <div className="form-group">
            <label className="form-label" htmlFor="country">
              <span>Country Where This Will Run *</span>
            </label>
            <select
              id="country"
              className="form-select"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value as ASEANCountry })}
            >
              <option value="SG">🇸🇬 Singapore</option>
              <option value="ID">🇮🇩 Indonesia</option>
              <option value="MY">🇲🇾 Malaysia</option>
              <option value="VN">🇻🇳 Vietnam</option>
              <option value="TH">🇹🇭 Thailand</option>
              <option value="PH">🇵🇭 Philippines</option>
            </select>
          </div>

          {/* Expected Pilot Duration */}
          <div className="form-group">
            <label className="form-label" htmlFor="duration">
              <span>How Long Should the Pilot Run? *</span>
              <span className="form-hint">{formData.expectedDurationWeeks} Weeks</span>
            </label>
            <select
              id="duration"
              className="form-select"
              value={formData.expectedDurationWeeks}
              onChange={(e) => setFormData({ ...formData, expectedDurationWeeks: Number(e.target.value) })}
            >
              <option value={4}>4 Weeks (Quick Test)</option>
              <option value={6}>6 Weeks (Standard Trial)</option>
              <option value={8}>8 Weeks (Full Pilot)</option>
              <option value={12}>12 Weeks (Extended Pilot)</option>
            </select>
          </div>

          {/* Business Problem Description */}
          <div className="form-group form-col-full">
            <label className="form-label" htmlFor="problem">
              <span>What Problem Are You Trying to Solve? *</span>
              <span className="form-hint">Explain what is slow, manual, or difficult today</span>
            </label>
            <textarea
              id="problem"
              required
              minLength={20}
              placeholder="Describe what is slow, manual, or hard to do today, and why your current tools cannot handle it..."
              className="form-textarea"
              value={formData.problemDescription}
              onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
            />
            <div className="form-error-msg">Please provide at least 20 characters describing your problem.</div>
          </div>

          {/* Desired Outcome */}
          <div className="form-group form-col-full">
            <label className="form-label" htmlFor="outcome">
              <span>What Does Success Look Like? *</span>
              <span className="form-hint">e.g. Cut review time by 40%, reduce errors, automate paperwork</span>
            </label>
            <textarea
              id="outcome"
              required
              minLength={15}
              placeholder="e.g., Cut alert review time by 40%, catch fraud within 15 minutes, reduce manual work..."
              className="form-textarea"
              style={{ minHeight: '80px' }}
              value={formData.desiredOutcome}
              onChange={(e) => setFormData({ ...formData, desiredOutcome: e.target.value })}
            />
            <div className="form-error-msg">Please specify what success looks like.</div>
          </div>

          {/* Technical Requirements */}
          <div className="form-group form-col-full">
            <label className="form-label" htmlFor="techReq">
              <span>Key Technical Features Needed</span>
              <span className="form-hint">Tags separated by commas (e.g. Fraud Detection, Mobile App, Cloud, GPS Tracking)</span>
            </label>
            <input
              id="techReq"
              type="text"
              placeholder="e.g., Transaction Monitoring, Fraud Screening, Explainable AI"
              className="form-input"
              value={formData.technicalRequirementsText}
              onChange={(e) => setFormData({ ...formData, technicalRequirementsText: e.target.value })}
            />
          </div>

          {/* Data Sensitivity */}
          <div className="form-group">
            <label className="form-label" htmlFor="sensitivity">
              <span>How Confidential is Your Data?</span>
            </label>
            <select
              id="sensitivity"
              className="form-select"
              value={formData.dataSensitivity}
              onChange={(e) => setFormData({ ...formData, dataSensitivity: e.target.value as any })}
            >
              <option value="Public">Public (Open information)</option>
              <option value="Internal">Internal (Company records)</option>
              <option value="Confidential">Confidential (Business sensitive)</option>
              <option value="Highly Restricted (PDPA/Banking Secret)">Highly Sensitive (Customer / Banking data)</option>
            </select>
          </div>

          {/* Budget Range */}
          <div className="form-group">
            <label className="form-label" htmlFor="budget">
              <span>Estimated Project Budget (USD)</span>
            </label>
            <input
              id="budget"
              type="text"
              className="form-input"
              value={formData.budgetRangeUSD}
              onChange={(e) => setFormData({ ...formData, budgetRangeUSD: e.target.value })}
            />
          </div>

          {/* Integration Constraints */}
          <div className="form-group form-col-full">
            <label className="form-label" htmlFor="constraints">
              <span>Systems to Connect & Rules</span>
              <span className="form-hint">e.g., Must connect to SAP, cloud storage, or on-premises servers</span>
            </label>
            <input
              id="constraints"
              type="text"
              placeholder="e.g., Connect to our database in read-only mode, data cannot leave our secure network"
              className="form-input"
              value={formData.integrationConstraints}
              onChange={(e) => setFormData({ ...formData, integrationConstraints: e.target.value })}
            />
          </div>

          {/* Local Data Residency Checkbox */}
          <div className="form-col-full" style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                checked={formData.requiresLocalDataResidency}
                onChange={(e) => setFormData({ ...formData, requiresLocalDataResidency: e.target.checked })}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <strong>Keep All Data In-Country:</strong> All test data and processing must stay inside ({formData.country}).
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px' }} />
                <span>Finding the best startups for you...</span>
              </>
            ) : (
              <span>Find Matching Startups →</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
