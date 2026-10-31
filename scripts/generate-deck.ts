import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

async function generatePitchDeck() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'ASEAN POC-Architect Team';
  pptx.company = 'Startup ASEAN / Cradle Hackathon';
  pptx.title = 'ASEAN POC-Architect — Minimalist Pitch Deck';

  // Palette: Clean Navy, Electric Cyan, Accent Blue, White, Slate
  const C = {
    bgDark: '0A192F',       // Deep Navy
    bgCard: '112240',       // Dark Card
    bgCardBorder: '233554', // Clean Border
    accentBlue: '3B82F6',   // Bright Blue
    accentCyan: '38BDF8',   // Electric Cyan
    accentEmerald: '10B981',// Success Green
    textWhite: 'FFFFFF',    // White
    textSlate: '94A3B8',    // Slate
    textMuted: '64748B',    // Muted
    pillBg: '1E3A8A'        // Pill
  };

  function createBaseSlide(title: string, category: string, subtitle?: string) {
    const slide = pptx.addSlide();
    slide.background = { color: C.bgDark };

    // Category Pill
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 5.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentCyan,
      bold: true,
      charSpacing: 2
    });

    // Main Title
    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.65,
      fontSize: 26,
      fontFace: 'Arial',
      color: C.textWhite,
      bold: true
    });

    // Subtitle if provided
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8,
        y: 1.45,
        w: 11.5,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.accentCyan
      });
    }

    return slide;
  }

  // =========================================================================
  // SLIDE 1: The Idea
  // =========================================================================
  {
    const s1 = pptx.addSlide();
    s1.background = { color: C.bgDark };

    // Tag Pill
    s1.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 2.8,
      h: 0.35,
      rectRadius: 0.15,
      fill: { color: '1E293B' },
      line: { color: C.accentBlue, width: 1 }
    });
    s1.addText('STARTUP ASEAN • 2026', {
      x: 0.8,
      y: 1.5,
      w: 2.8,
      h: 0.35,
      fontSize: 9,
      fontFace: 'Arial',
      color: C.accentCyan,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    // Main Title
    s1.addText('ASEAN POC-Architect', {
      x: 0.8,
      y: 2.0,
      w: 11.5,
      h: 1.1,
      fontSize: 48,
      fontFace: 'Arial',
      color: C.textWhite,
      bold: true
    });

    // Subtitle
    s1.addText('From business connections to real pilot projects.', {
      x: 0.8,
      y: 3.1,
      w: 11.5,
      h: 0.5,
      fontSize: 22,
      fontFace: 'Arial',
      color: C.accentCyan
    });

    // 3 Clean Cards (Minimal words)
    const cards = [
      { num: '01', title: 'Match', text: 'Connect enterprise problems to the right startup.' },
      { num: '02', title: 'Plan', text: 'Build a practical 60-day trial plan in seconds.' },
      { num: '03', title: 'Review', text: 'Generate a ready-to-sign pilot agreement.' }
    ];

    cards.forEach((c, idx) => {
      const xPos = 0.8 + idx * 3.9;
      s1.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.2,
        w: 3.6,
        h: 2.2,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s1.addText(c.num, {
        x: xPos + 0.35,
        y: 4.5,
        w: 1.0,
        h: 0.35,
        fontSize: 16,
        fontFace: 'Arial',
        color: C.accentBlue,
        bold: true
      });

      s1.addText(c.title, {
        x: xPos + 0.35,
        y: 4.95,
        w: 2.9,
        h: 0.4,
        fontSize: 18,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s1.addText(c.text, {
        x: xPos + 0.35,
        y: 5.45,
        w: 2.9,
        h: 0.7,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.textSlate,
        lineSpacing: 18
      });
    });

    s1.addNotes(
      "Good morning, judges. Every year across ASEAN, events bring startups and corporations together. People shake hands and exchange cards. But on Monday morning, nothing happens.\n\n" +
      "We are ASEAN POC-Architect. Our mission is simple: From business connections to real pilot projects. We take an enterprise problem, find the right startup, and build a 60-day trial plan in seconds."
    );
  }

  // =========================================================================
  // SLIDE 2: The Problem
  // =========================================================================
  {
    const s2 = createBaseSlide(
      'Good connections. No action.',
      'The Problem',
      'Summits create handshakes. Not business contracts.'
    );

    const painPoints = [
      {
        tag: 'FOR ENTERPRISES',
        headline: 'Hard to Find the Right Startup',
        body: 'Scattered across 10 countries. Marketing hides real readiness.'
      },
      {
        tag: 'FOR STARTUPS',
        headline: 'Hard to Reach Decision-Makers',
        body: 'Endless intro meetings with teams who lack budget authority.'
      },
      {
        tag: 'FOR BOTH SIDES',
        headline: 'Trial Scoping Takes 3 Months',
        body: 'Slow coordination on data rules, tasks, and success goals.'
      }
    ];

    painPoints.forEach((p, idx) => {
      const xPos = 0.8 + idx * 3.9;

      s2.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.3,
        w: 3.6,
        h: 4.2,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s2.addText(p.tag, {
        x: xPos + 0.35,
        y: 2.7,
        w: 2.9,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.accentBlue,
        bold: true
      });

      s2.addText(p.headline, {
        x: xPos + 0.35,
        y: 3.1,
        w: 2.9,
        h: 0.9,
        fontSize: 18,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s2.addShape(pptx.ShapeType.line, {
        x: xPos + 0.35,
        y: 4.15,
        w: 2.9,
        h: 0,
        line: { color: C.bgCardBorder, width: 1 }
      });

      s2.addText(p.body, {
        x: xPos + 0.35,
        y: 4.4,
        w: 2.9,
        h: 1.5,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.textSlate,
        lineSpacing: 20
      });
    });

    s2.addNotes(
      "Why don't meetings turn into deals? Three simple reasons:\n\n" +
      "1. Enterprises cannot easily find the right startup across 10 different countries.\n" +
      "2. Startups get trapped in friendly coffee chats without ever reaching decision-makers.\n" +
      "3. Setting up a trial takes months of slow emails on scopes and data rules. Momentum is lost."
    );
  }

  // =========================================================================
  // SLIDE 3: Why This Matters
  // =========================================================================
  {
    const s3 = createBaseSlide(
      'ASEAN has opportunities. Turning them into deals is the challenge.',
      'Why This Matters',
      'The startups and funding are here. We need the bridge to make pilots happen.'
    );

    const stats = [
      {
        stat: '4,000+',
        label: 'Startups in ASEAN',
        sub: 'Huge talent across the region ready to work with big companies.',
        src: 'Source: Startup ASEAN Launch Briefing, June 2025'
      },
      {
        stat: 'US$226B',
        label: 'Foreign Investment (2024)',
        sub: 'Strong regional funding and corporate demand for digital solutions.',
        src: 'Source: ASEAN Investment Report 2024'
      }
    ];

    stats.forEach((st, idx) => {
      const xPos = 0.8 + idx * 5.9;

      s3.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.2,
        w: 5.6,
        h: 3.3,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s3.addText(st.stat, {
        x: xPos + 0.5,
        y: 2.5,
        w: 4.6,
        h: 1.0,
        fontSize: 54,
        fontFace: 'Arial',
        color: C.accentCyan,
        bold: true
      });

      s3.addText(st.label, {
        x: xPos + 0.5,
        y: 3.55,
        w: 4.6,
        h: 0.4,
        fontSize: 18,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s3.addText(st.sub, {
        x: xPos + 0.5,
        y: 4.0,
        w: 4.6,
        h: 0.7,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.textSlate
      });

      s3.addText(st.src, {
        x: xPos + 0.5,
        y: 4.85,
        w: 4.6,
        h: 0.35,
        fontSize: 9,
        fontFace: 'Arial',
        color: C.textMuted,
        italic: true
      });
    });

    // Clean bottom note
    s3.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.75,
      w: 11.5,
      h: 0.8,
      rectRadius: 0.08,
      fill: { color: '172A46' },
      line: { color: C.accentBlue, width: 1 }
    });

    s3.addText(
      'These numbers show huge potential. What we need is a practical tool to turn handshakes into pilots.',
      {
        x: 1.1,
        y: 5.75,
        w: 10.9,
        h: 0.8,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.textWhite,
        valign: 'middle'
      }
    );

    s3.addNotes(
      "Look at the numbers: over 4,000 startups were recorded at Startup ASEAN's launch in June 2025. And foreign investment reached 226 billion dollars in 2024.\n\n" +
      "The market is huge. The talent is here. The money is here. The only missing piece is a fast way to get them testing real projects together."
    );
  }

  // =========================================================================
  // SLIDE 4: Our Solution
  // =========================================================================
  {
    const s4 = createBaseSlide(
      'Meet ASEAN POC-Architect.',
      'Our Solution',
      '4 simple steps from business problem to signed pilot.'
    );

    const steps = [
      { num: '1', title: 'Understand', desc: 'Reads the business problem, tech needs, and security rules.' },
      { num: '2', title: 'Match', desc: 'Fairly scores startups on skills, tech fit, and readiness.' },
      { num: '3', title: 'Plan', desc: 'Builds a realistic 60-day trial plan with clear goals.' },
      { num: '4', title: 'Review', desc: 'Produces an exportable proposal for human sign-off.' }
    ];

    steps.forEach((st, idx) => {
      const xPos = 0.8 + idx * 2.92;

      s4.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.3,
        w: 2.75,
        h: 4.2,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s4.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.3,
        y: 2.6,
        w: 0.6,
        h: 0.6,
        rectRadius: 0.1,
        fill: { color: C.pillBg },
        line: { color: C.accentBlue, width: 1 }
      });

      s4.addText(st.num, {
        x: xPos + 0.3,
        y: 2.6,
        w: 0.6,
        h: 0.6,
        fontSize: 14,
        fontFace: 'Arial',
        color: C.accentCyan,
        bold: true,
        align: 'center',
        valign: 'middle'
      });

      s4.addText(st.title, {
        x: xPos + 0.3,
        y: 3.4,
        w: 2.15,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s4.addText(st.desc, {
        x: xPos + 0.3,
        y: 4.1,
        w: 2.15,
        h: 2.0,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.textSlate,
        lineSpacing: 19
      });
    });

    s4.addNotes(
      "Here is how our system works in four simple steps:\n\n" +
      "1. Understand: We take in the enterprise challenge and privacy requirements.\n" +
      "2. Match: We score startups transparently on verified abilities.\n" +
      "3. Plan: We generate a 60-day trial plan with milestones and goals.\n" +
      "4. Review: We output a formal proposal for human approval."
    );
  }

  // =========================================================================
  // SLIDE 5: Product Demonstration
  // =========================================================================
  {
    const s5 = createBaseSlide(
      'From challenge to pilot in minutes.',
      'Live Product Demo',
      'Example: Malaysian Bank (Demonstration Data)'
    );

    // Left Column: Challenge & Match
    s5.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.2,
      w: 5.6,
      h: 4.4,
      rectRadius: 0.1,
      fill: { color: C.bgCard },
      line: { color: C.bgCardBorder, width: 1 }
    });

    s5.addText('CHALLENGE: FRAUD DETECTION', {
      x: 1.1,
      y: 2.4,
      w: 5.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentBlue,
      bold: true
    });

    s5.addText('Bank needs to reduce 84% false fraud alarms without touching live customer accounts.', {
      x: 1.1,
      y: 2.7,
      w: 5.0,
      h: 0.6,
      fontSize: 12,
      fontFace: 'Arial',
      color: C.textSlate
    });

    s5.addShape(pptx.ShapeType.line, {
      x: 1.1,
      y: 3.4,
      w: 5.0,
      h: 0,
      line: { color: C.bgCardBorder, width: 1 }
    });

    s5.addText('STARTUP MATCHES', {
      x: 1.1,
      y: 3.55,
      w: 5.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentBlue,
      bold: true
    });

    // 3 Clean Rows
    const candidates = [
      { name: 'SentriShield AI (SG)', score: '94% FIT', tag: 'SELECTED (Fast & Bank-Ready)', col: C.accentEmerald },
      { name: 'Tookitaki FinSights (SG)', score: '89% FIT', tag: 'Alternative Option', col: C.accentBlue },
      { name: 'Cynopsis Solutions (SG)', score: '78% FIT', tag: 'Missing real-time streaming', col: C.textMuted }
    ];

    candidates.forEach((cand, cIdx) => {
      const yP = 3.9 + cIdx * 0.8;
      s5.addShape(pptx.ShapeType.roundRect, {
        x: 1.1,
        y: yP,
        w: 5.0,
        h: 0.68,
        rectRadius: 0.08,
        fill: { color: '172A46' },
        line: { color: cand.col === C.accentEmerald ? C.accentEmerald : C.bgCardBorder, width: 1 }
      });

      s5.addText(cand.name, {
        x: 1.25,
        y: yP + 0.1,
        w: 3.4,
        h: 0.25,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s5.addText(cand.tag, {
        x: 1.25,
        y: yP + 0.35,
        w: 3.4,
        h: 0.25,
        fontSize: 9,
        fontFace: 'Arial',
        color: cand.col
      });

      s5.addText(cand.score, {
        x: 4.7,
        y: yP + 0.18,
        w: 1.2,
        h: 0.3,
        fontSize: 14,
        fontFace: 'Arial',
        color: cand.col,
        bold: true,
        align: 'right'
      });
    });

    // Right Column: 60-Day Pilot
    s5.addShape(pptx.ShapeType.roundRect, {
      x: 6.7,
      y: 2.2,
      w: 5.6,
      h: 4.4,
      rectRadius: 0.1,
      fill: { color: C.bgCard },
      line: { color: C.bgCardBorder, width: 1 }
    });

    s5.addText('GENERATED 60-DAY PILOT ROADMAP', {
      x: 7.0,
      y: 2.4,
      w: 5.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: C.accentBlue,
      bold: true
    });

    const phases = [
      { time: 'Weeks 1–2', title: 'Safe Sandbox Setup', desc: 'Secure connection with test data. Zero customer data touched.' },
      { time: 'Weeks 3–6', title: 'Speed & Accuracy Test', desc: 'Run real-time fraud alerts in shadow mode. No live changes.' },
      { time: 'Weeks 7–8', title: 'Management Review', desc: 'Present results to risk committee for commercial contract.' }
    ];

    phases.forEach((ph, pIdx) => {
      const yPos = 2.8 + pIdx * 0.95;
      s5.addText(`${ph.time}: ${ph.title}`, {
        x: 7.0,
        y: yPos,
        w: 5.0,
        h: 0.28,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.accentCyan,
        bold: true
      });
      s5.addText(ph.desc, {
        x: 7.0,
        y: yPos + 0.28,
        w: 5.0,
        h: 0.55,
        fontSize: 11,
        fontFace: 'Arial',
        color: C.textSlate
      });
    });

    // Callout
    s5.addShape(pptx.ShapeType.roundRect, {
      x: 7.0,
      y: 5.65,
      w: 5.0,
      h: 0.75,
      rectRadius: 0.08,
      fill: { color: '1E293B' },
      line: { color: C.accentBlue, width: 1 }
    });

    s5.addText('PILOT GOAL: Cut false alarms by 40% with zero risk to live banking.', {
      x: 7.15,
      y: 5.65,
      w: 4.7,
      h: 0.75,
      fontSize: 11,
      fontFace: 'Arial',
      color: C.textWhite,
      bold: true,
      valign: 'middle'
    });

    s5.addNotes(
      "Let's see this in action with a realistic demo scenario: a Malaysian bank.\n\n" +
      "The bank has an 84% false alarm rate on fraud alerts. Our tool evaluated 3 startups and found SentriShield AI at a 94% fit because they are ready for bank-grade security.\n\n" +
      "In seconds, it built a 60-day roadmap: Weeks 1-2 for safe setup, Weeks 3-6 to test accuracy in shadow mode, and Weeks 7-8 for final review. The goal is clear: cut false alarms by 40%."
    );
  }

  // =========================================================================
  // SLIDE 6: AI Differentiation
  // =========================================================================
  {
    const s6 = createBaseSlide(
      'More than a chatbot. More than a database.',
      'AI Differentiation',
      'Why simple chatbots fail at enterprise pilot scoping.'
    );

    const pillars = [
      { name: 'Understand', desc: 'Pulls exact business requirements from plain text.' },
      { name: 'Match', desc: 'Fair, transparent scoring — zero black-box guessing.' },
      { name: 'Plan', desc: 'Builds realistic timelines, deliverables, and tasks.' },
      { name: 'Check', desc: 'Catches missing data, security rules, and risks.' }
    ];

    pillars.forEach((p, idx) => {
      const xPos = 0.8 + idx * 2.92;

      s6.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.3,
        w: 2.75,
        h: 3.2,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s6.addText(p.name, {
        x: xPos + 0.3,
        y: 2.6,
        w: 2.15,
        h: 0.45,
        fontSize: 18,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s6.addShape(pptx.ShapeType.line, {
        x: xPos + 0.3,
        y: 3.2,
        w: 2.15,
        h: 0,
        line: { color: C.bgCardBorder, width: 1 }
      });

      s6.addText(p.desc, {
        x: xPos + 0.3,
        y: 3.4,
        w: 2.15,
        h: 1.8,
        fontSize: 13,
        fontFace: 'Arial',
        color: C.textSlate,
        lineSpacing: 19
      });
    });

    // Simple Architecture Note
    s6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.8,
      w: 11.5,
      h: 0.8,
      rectRadius: 0.08,
      fill: { color: '172A46' },
      line: { color: C.accentBlue, width: 1 }
    });

    s6.addText(
      'FLEXIBLE AI: Runs fast in the cloud with Gemma 4, or 100% offline on a laptop for complete bank privacy.',
      {
        x: 1.1,
        y: 5.8,
        w: 10.9,
        h: 0.8,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true,
        valign: 'middle'
      }
    );

    s6.addNotes(
      "Why not just use ChatGPT? Because simple chatbots guess and make things up. If a bank asks for real-time security, a chatbot will say 'Sure, any startup can do that.' That is how pilots fail.\n\n" +
      "Our system has four clear steps: Understand, Match, Plan, and Check. It scores startups fairly with transparent numbers.\n\n" +
      "Best of all: it can run completely offline on a local laptop using open-weight Gemma, so private company data never leaves the building."
    );
  }

  // =========================================================================
  // SLIDE 7: Impact & Vision
  // =========================================================================
  {
    const s7 = createBaseSlide(
      'Make every connection count.',
      'Impact & Vision',
      'Turning summit handshakes into measurable economic outcomes.'
    );

    const benefits = [
      { who: 'FOR ENTERPRISES', what: 'Fast, Safe Pilots', detail: 'Test startups in weeks, not months, with clear safety guardrails.' },
      { who: 'FOR STARTUPS', what: 'Direct Corporate Access', detail: 'Skip the endless pitch meetings and get straight to real trials.' },
      { who: 'FOR THE ECOSYSTEM', what: 'Measurable Outcomes', detail: 'Helps Cradle and Startup ASEAN prove real deals came from events.' }
    ];

    benefits.forEach((b, idx) => {
      const xPos = 0.8 + idx * 3.9;

      s7.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.2,
        w: 3.6,
        h: 2.7,
        rectRadius: 0.1,
        fill: { color: C.bgCard },
        line: { color: C.bgCardBorder, width: 1 }
      });

      s7.addText(b.who, {
        x: xPos + 0.35,
        y: 2.5,
        w: 2.9,
        h: 0.25,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.accentBlue,
        bold: true
      });

      s7.addText(b.what, {
        x: xPos + 0.35,
        y: 2.8,
        w: 2.9,
        h: 0.4,
        fontSize: 17,
        fontFace: 'Arial',
        color: C.textWhite,
        bold: true
      });

      s7.addText(b.detail, {
        x: xPos + 0.35,
        y: 3.3,
        w: 2.9,
        h: 1.3,
        fontSize: 12,
        fontFace: 'Arial',
        color: C.textSlate,
        lineSpacing: 18
      });
    });

    // 4 Goals
    s7.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 5.15,
      w: 11.5,
      h: 0.8,
      rectRadius: 0.08,
      fill: { color: '172A46' },
      line: { color: C.accentBlue, width: 1 }
    });

    s7.addText(
      'OUTCOMES WE TRACK:  Proposal Time (Months → Minutes)  •  Match Quality  •  Approved Trials  •  Live Commercial Contracts',
      {
        x: 1.0,
        y: 5.15,
        w: 11.1,
        h: 0.8,
        fontSize: 10,
        fontFace: 'Arial',
        color: C.accentCyan,
        bold: true,
        align: 'center',
        valign: 'middle'
      }
    );

    // Closing
    s7.addText('“ASEAN POC-Architect — Turning connections into collaboration.”', {
      x: 0.8,
      y: 6.2,
      w: 11.5,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Arial',
      color: C.textWhite,
      bold: true,
      align: 'center'
    });

    s7.addNotes(
      "To conclude: ASEAN POC-Architect helps everyone.\n\n" +
      "Enterprises test technology quickly and safely. Startups get direct access to real trials. And our event hosts—Cradle and Startup ASEAN—can finally measure how many summit handshakes became real deals.\n\n" +
      "Thank you, judges. We are ASEAN POC-Architect — Turning connections into collaboration. We welcome your questions."
    );
  }

  // Save PPTX
  const outPath1 = path.join(process.cwd(), 'presentation', 'ASEAN_POC_Architect_Pitch.pptx');
  const outPath2 = path.join(process.cwd(), 'public', 'ASEAN_POC_Architect_Pitch.pptx');

  await pptx.writeFile({ fileName: outPath1 });
  fs.copyFileSync(outPath1, outPath2);

  console.log(`[PPTX Minimal] Successfully generated clean deck!`);
}

generatePitchDeck().catch(console.error);
