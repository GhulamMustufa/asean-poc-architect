import { jsPDF } from 'jspdf';
import { PilotProposal } from '@/types';

/**
 * Sanitizes strings for PDF Type 1 standard fonts (Helvetica).
 * Eliminates character distortion, spacing artifacts, and unicode replacement errors
 * (e.g. '≤' becoming '"d', '✕' becoming apostrophes, '⚠' becoming '&').
 */
function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[≤]/g, '<= ')
    .replace(/[≥]/g, '>= ')
    .replace(/[✓✔]/g, '[OK]')
    .replace(/[✕✖✗]/g, '[X]')
    .replace(/[⚠]/g, '[!]')
    .replace(/[⚖]/g, '[LEGAL]')
    .replace(/[•●]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[…]/g, '...')
    .replace(/[➔→]/g, '->')
    .replace(/[^\x00-\x7F]/g, ''); // strip any unsupported non-ASCII characters
}

/**
 * Generates a clean, professional multi-page PDF document for an ASEAN Pilot Proposal.
 * Follows enterprise styling standards, pagination, and includes the mandatory disclaimer label:
 * "Draft Pilot Proposal — Subject to Business, Technical and Legal Review."
 */
export function generateProposalPdf(proposal: PilotProposal): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight; // 180mm
  const bottomMargin = 20;
  const headerHeight = 20;

  let cursorY = headerHeight + 5;

  // Primary palette (Dark slate / cyan / emerald accents)
  const colorPrimary = [15, 23, 42];     // #0f172a (Slate 900)
  const colorSecondary = [71, 85, 105];  // #475569 (Slate 600)
  const colorAccent = [2, 132, 199];     // #0284c7 (Sky 600)
  const colorGreen = [5, 150, 105];      // #059669 (Emerald 600)
  const colorDark = [30, 41, 59];        // #1e293b
  const colorLightBg = [248, 250, 252];  // #f8fafc

  /**
   * Helper to ensure space on page, adding a new page if needed
   */
  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      cursorY = headerHeight + 5;
    }
  };

  /**
   * Draws a section header bar with anti-orphan protection.
   * Ensures that the section title is NEVER isolated at the bottom of a page
   * without its accompanying content.
   */
  const drawSectionHeader = (title: string, badge?: string, minContentSpace: number = 24) => {
    ensureSpace(12 + minContentSpace);
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.roundedRect(marginLeft, cursorY, contentWidth, 8, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(sanitizePdfText(title), marginLeft + 3, cursorY + 5.5);

    if (badge) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const isEdited = badge.includes('EDITED');
      if (isEdited) {
        doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
      } else {
        doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
      }
      doc.text(sanitizePdfText(badge), marginLeft + contentWidth - 3, cursorY + 5.5, { align: 'right' });
    }

    cursorY += 12;
  };

  // ---------------------------------------------------------------------------
  // COVER / HEADER BLOCK
  // ---------------------------------------------------------------------------
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(marginLeft, cursorY, contentWidth, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 165, 233); // Cyan
  doc.text('ASEAN POC-ARCHITECT - PROOF-OF-CONCEPT PROPOSAL', marginLeft + 5, cursorY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(sanitizePdfText(proposal.challengeTitle), contentWidth - 10);
  doc.text(titleLines.slice(0, 2), marginLeft + 5, cursorY + 14);

  // Status & Metadata bar inside cover
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const statusStr = `Status: ${proposal.status.toUpperCase()}  |  Version: v${proposal.version}.0  |  Proposal ID: ${proposal.id}`;
  doc.text(sanitizePdfText(statusStr), marginLeft + 5, cursorY + 33);

  cursorY += 44;

  // ---------------------------------------------------------------------------
  // KEY PARTIES OVERVIEW GRID (Strict column containment to prevent overlaps)
  // ---------------------------------------------------------------------------
  ensureSpace(28);
  const cardHeight = 24;
  const colWidth = (contentWidth - 10) / 3; // ~56.6mm each

  doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
  doc.roundedRect(marginLeft, cursorY, contentWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginLeft, cursorY, contentWidth, cardHeight, 2, 2, 'S');

  // Column 1: Enterprise Partner
  const col1X = marginLeft + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('ENTERPRISE PARTNER', col1X, cursorY + 5);

  doc.setFontSize(9);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  const entLines = doc.splitTextToSize(sanitizePdfText(proposal.enterpriseName), colWidth - 4);
  doc.text(entLines.slice(0, 2), col1X, cursorY + 10);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('Problem Owner', col1X, cursorY + 19);

  // Column 2: Startup Solution Partner
  const col2X = marginLeft + 4 + colWidth + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('STARTUP SOLUTION PARTNER', col2X, cursorY + 5);

  doc.setFontSize(9);
  doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  const startupTitle = `${proposal.startupName} [${proposal.startupCountry}]`;
  const startupLines = doc.splitTextToSize(sanitizePdfText(startupTitle), colWidth - 4);
  doc.text(startupLines.slice(0, 2), col2X, cursorY + 10);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  const startupProvenance = proposal.sourceSnapshot?.startup?.isSyntheticDemo
    ? 'Synthetic Benchmark Control'
    : `Verified: ${proposal.sourceSnapshot?.startup?.sourceOrganisation || 'Enterprise Singapore / Cradle'}`;
  const provLines = doc.splitTextToSize(sanitizePdfText(startupProvenance), colWidth - 4);
  doc.text(provLines[0], col2X, cursorY + 19);

  // Column 3: Pilot Duration
  const col3X = marginLeft + 4 + (colWidth + 5) * 2;
  const totalWeeks = proposal.milestones?.reduce((acc, m) => acc + m.durationWeeks, 0) || 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('PILOT DURATION', col3X, cursorY + 5);

  doc.setFontSize(9);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text(`${totalWeeks} Weeks (60-Day Trial)`, col3X, cursorY + 10);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('Phased Staging Sandbox', col3X, cursorY + 19);

  cursorY += cardHeight + 6;

  // Human Sign-off Verification if Approved
  if (proposal.status === 'Approved' && proposal.approvalRecord) {
    ensureSpace(16);
    doc.setFillColor(236, 253, 245); // light green
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(marginLeft, cursorY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
    doc.text('[VERIFIED] FORMAL HUMAN SIGN-OFF RECORDED', marginLeft + 4, cursorY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    const approverText = `Approved by: ${proposal.approvalRecord.decidedBy || 'Enterprise Sponsor'} (${proposal.approvalRecord.deciderRole || 'Executive'}) on ${new Date(proposal.approvalRecord.decidedAt || proposal.updatedAt).toLocaleDateString()}`;
    doc.text(sanitizePdfText(approverText), marginLeft + 4, cursorY + 10);
    cursorY += 18;
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: EXECUTIVE SUMMARY
  // ---------------------------------------------------------------------------
  const execBadge = proposal.editedFields?.includes('executiveSummary')
    ? '[USER EDITED]'
    : '[AI GENERATED]';
  drawSectionHeader('1. Executive Summary', execBadge, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  const execLines = doc.splitTextToSize(sanitizePdfText(proposal.executiveSummary), contentWidth);
  ensureSpace(execLines.length * 4.2);
  doc.text(execLines, marginLeft, cursorY);
  cursorY += execLines.length * 4.2 + 6;

  // ---------------------------------------------------------------------------
  // SECTION 2: PROBLEM STATEMENT & PROPOSED SOLUTION
  // ---------------------------------------------------------------------------
  drawSectionHeader('2. Problem Statement & Proposed Pilot Solution', undefined, 25);

  // Problem Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
  doc.text('Enterprise Problem Baseline:', marginLeft, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  const problemLines = doc.splitTextToSize(sanitizePdfText(proposal.problemStatement), contentWidth);
  ensureSpace(problemLines.length * 4.2);
  doc.text(problemLines, marginLeft, cursorY);
  cursorY += problemLines.length * 4.2 + 5;

  // Solution Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
  doc.text('Proposed Pilot Solution & Methodology:', marginLeft, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  const solutionLines = doc.splitTextToSize(sanitizePdfText(proposal.proposedSolution), contentWidth);
  ensureSpace(solutionLines.length * 4.2);
  doc.text(solutionLines, marginLeft, cursorY);
  cursorY += solutionLines.length * 4.2 + 6;

  // ---------------------------------------------------------------------------
  // SECTION 3: SCOPE & BOUNDARIES
  // ---------------------------------------------------------------------------
  const scopeBadge = (proposal.editedFields?.includes('inScope') || proposal.editedFields?.includes('outOfScope'))
    ? '[USER EDITED]'
    : '[AI GENERATED]';
  drawSectionHeader('3. Scope Boundaries & Technical Architecture', scopeBadge, 30);

  // In Scope List
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
  doc.text('In-Scope Pilot Activities:', marginLeft, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  for (const item of proposal.inScope) {
    const itemLines = doc.splitTextToSize(`- ${sanitizePdfText(item)}`, contentWidth - 4);
    ensureSpace(itemLines.length * 3.8);
    doc.text(itemLines, marginLeft + 2, cursorY);
    cursorY += itemLines.length * 3.8 + 1.2;
  }
  cursorY += 3;

  // Out of Scope List (Fixed unicode cross to clean standard ASCII bullet)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(190, 18, 60); // Red
  doc.text('Out-of-Scope Exclusions:', marginLeft, cursorY);
  cursorY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  for (const item of proposal.outOfScope) {
    const itemLines = doc.splitTextToSize(`[X]  ${sanitizePdfText(item)}`, contentWidth - 4);
    ensureSpace(itemLines.length * 3.8);
    doc.text(itemLines, marginLeft + 2, cursorY);
    cursorY += itemLines.length * 3.8 + 1.2;
  }
  cursorY += 4;

  // Integration Architecture
  if (proposal.integrationArchitecture) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text('Integration Topology & Network Boundary:', marginLeft, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    const archLines = doc.splitTextToSize(sanitizePdfText(proposal.integrationArchitecture), contentWidth);
    ensureSpace(archLines.length * 3.8);
    doc.text(archLines, marginLeft, cursorY);
    cursorY += archLines.length * 3.8 + 6;
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: 60-DAY PILOT ROADMAP & MILESTONES
  // ---------------------------------------------------------------------------
  const milestoneBadge = proposal.editedFields?.includes('milestones')
    ? '[USER EDITED]'
    : '[AI GENERATED]';
  drawSectionHeader('4. Phased Pilot Roadmap & Acceptance Gates', milestoneBadge, 35);

  proposal.milestones?.forEach((m, idx) => {
    ensureSpace(28);
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.roundedRect(marginLeft, cursorY, contentWidth, 6, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(`${idx + 1}. ${sanitizePdfText(m.title)}`, marginLeft + 3, cursorY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text(`${m.durationWeeks} Wks`, marginLeft + contentWidth - 3, cursorY + 4.2, { align: 'right' });
    cursorY += 8.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.text('Deliverables:', marginLeft + 2, cursorY);
    cursorY += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    m.deliverables?.forEach((deliv) => {
      const delivLines = doc.splitTextToSize(`- ${sanitizePdfText(deliv)}`, contentWidth - 6);
      ensureSpace(delivLines.length * 3.4);
      doc.text(delivLines, marginLeft + 4, cursorY);
      cursorY += delivLines.length * 3.4 + 0.8;
    });

    // Acceptance Criteria
    ensureSpace(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
    doc.text('Gate Acceptance Criteria: ', marginLeft + 2, cursorY);
    const critX = marginLeft + 38;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const critLines = doc.splitTextToSize(sanitizePdfText(m.acceptanceCriteria), contentWidth - 40);
    doc.text(critLines, critX, cursorY);
    cursorY += critLines.length * 3.4 + 4;
  });
  cursorY += 3;

  // ---------------------------------------------------------------------------
  // SECTION 5: RESPONSIBILITIES (RACI MATRIX)
  // ---------------------------------------------------------------------------
  const raciBadge = proposal.editedFields?.includes('raciMatrix')
    ? '[USER EDITED]'
    : '[AI GENERATED]';
  drawSectionHeader('5. Governance & Responsibility Matrix (RACI)', raciBadge, 35);

  // Table header
  ensureSpace(12);
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(marginLeft, cursorY, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Activity / Key Workstream', marginLeft + 3, cursorY + 4.2);
  doc.text('Enterprise', marginLeft + 88, cursorY + 4.2);
  doc.text('Startup', marginLeft + 112, cursorY + 4.2);
  doc.text('Operational Notes', marginLeft + 132, cursorY + 4.2);
  cursorY += 6;

  proposal.raciMatrix?.forEach((r, idx) => {
    ensureSpace(8);
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginLeft, cursorY, contentWidth, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const actLines = doc.splitTextToSize(sanitizePdfText(r.activity), 80);
    doc.text(actLines[0], marginLeft + 3, cursorY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text(sanitizePdfText(r.enterpriseRole), marginLeft + 88, cursorY + 4.5);
    doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
    doc.text(sanitizePdfText(r.startupRole), marginLeft + 112, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    const noteLines = doc.splitTextToSize(sanitizePdfText(r.notes || ''), contentWidth - 134);
    doc.text(noteLines[0] || '', marginLeft + 132, cursorY + 4.5);
    cursorY += 7;
  });
  cursorY += 5;

  // ---------------------------------------------------------------------------
  // SECTION 6: TARGET KPIS & MEASUREMENT
  // ---------------------------------------------------------------------------
  const kpiBadge = proposal.editedFields?.includes('kpis')
    ? '[USER EDITED]'
    : '[AI GENERATED]';
  drawSectionHeader('6. Target Success KPIs & Validation Methodology', kpiBadge, 30);

  proposal.kpis?.forEach((k, idx) => {
    ensureSpace(16);
    doc.setFillColor(colorLightBg[0], colorLightBg[1], colorLightBg[2]);
    doc.roundedRect(marginLeft, cursorY, contentWidth, 14, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
    doc.text(`KPI #${idx + 1}: ${sanitizePdfText(k.metric)}`, marginLeft + 3, cursorY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.text(`Baseline: ${sanitizePdfText(k.baseline)}`, marginLeft + 3, cursorY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colorGreen[0], colorGreen[1], colorGreen[2]);
    doc.text(`Target: ${sanitizePdfText(k.target)} (Subject to Sandbox Validation)`, marginLeft + 3, cursorY + 11.5);

    cursorY += 16.5;
  });
  cursorY += 3;

  // ---------------------------------------------------------------------------
  // SECTION 7: RISKS & SOVEREIGN DATA RESIDENCY (Protected from orphan headers)
  // ---------------------------------------------------------------------------
  drawSectionHeader('7. Technical Risks & Sovereign Data Residency Plan', undefined, 38);

  ensureSpace(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('Identified Technical Risks & Mitigation:', marginLeft, cursorY);
  cursorY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  proposal.technicalRisks?.forEach((r) => {
    const riskLines = doc.splitTextToSize(`* ${sanitizePdfText(r)}`, contentWidth - 4);
    ensureSpace(riskLines.length * 3.4);
    doc.text(riskLines, marginLeft + 2, cursorY);
    cursorY += riskLines.length * 3.4 + 1;
  });
  cursorY += 3;

  if (proposal.dataResidencyPlan) {
    ensureSpace(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colorAccent[0], colorAccent[1], colorAccent[2]);
    doc.text('Data Residency & Sovereign Cloud Plan:', marginLeft, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const resLines = doc.splitTextToSize(sanitizePdfText(proposal.dataResidencyPlan), contentWidth);
    ensureSpace(resLines.length * 3.4);
    doc.text(resLines, marginLeft, cursorY);
    cursorY += resLines.length * 3.4 + 5;
  }

  // ---------------------------------------------------------------------------
  // SECTION 8: MANDATORY ADVISORY DISCLAIMER
  // ---------------------------------------------------------------------------
  ensureSpace(24);
  doc.setFillColor(254, 243, 199); // Amber tint
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(marginLeft, cursorY, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('REGULATORY & STATUTORY DISCLAIMER', marginLeft + 3, cursorY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  const disclaimerText = proposal.legalDisclaimer ||
    'ADVISORY NOTICE: This Proof-of-Concept proposal is a technical and operational exploration draft generated by ASEAN POC-Architect. It does not constitute formal statutory regulatory authorization, legal contract execution, or binding commercial procurement. All legal covenants and compliance reviews must be executed through formal corporate channels.';
  const discLines = doc.splitTextToSize(sanitizePdfText(disclaimerText), contentWidth - 6);
  doc.text(discLines, marginLeft + 3, cursorY + 8.5);

  // ---------------------------------------------------------------------------
  // GLOBAL HEADERS & FOOTERS ACROSS ALL PAGES
  // ---------------------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Header Label Bar on every page
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 0, pageWidth, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(225, 29, 72); // Red alert label
    doc.text(
      'Draft Pilot Proposal - Subject to Business, Technical and Legal Review.',
      pageWidth / 2,
      7,
      { align: 'center' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 11, pageWidth, 11);

    // Footer on every page
    doc.setDrawColor(226, 232, 240);
    doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorSecondary[0], colorSecondary[1], colorSecondary[2]);
    doc.text(
      'ASEAN POC-Architect - Confidential Staged Pilot Proposal',
      marginLeft,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - marginRight,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Convenience helper to generate and trigger browser file download for the PDF.
 */
export function downloadProposalPdf(proposal: PilotProposal): void {
  const doc = generateProposalPdf(proposal);
  const cleanEnterprise = proposal.enterpriseName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
  const cleanStartup = proposal.startupName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
  const filename = `${proposal.id}-${cleanEnterprise}-${cleanStartup}-pilot-proposal.pdf`;
  doc.save(filename);
}
