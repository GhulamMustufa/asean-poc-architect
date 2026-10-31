import * as fs from 'fs';
import * as path from 'path';

const sourceHtmlPath = path.join(process.cwd(), 'presentation', 'index.html');
const rawHtml = fs.readFileSync(sourceHtmlPath, 'utf8');

const printableHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ASEAN POC-Architect — Minimalist Pitch Deck (PDF Print Edition)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          },
          colors: {
            navy: {
              950: '#070D19',
              900: '#0A192F',
              850: '#0F2444',
              800: '#112240',
              700: '#172A46',
              600: '#233554'
            },
            cyan: {
              400: '#38BDF8',
              500: '#0EA5E9'
            }
          }
        }
      }
    };
  </script>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background-color: #070D19;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .glass-card {
      background: rgba(17, 34, 64, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(35, 53, 84, 0.8);
    }

    /* Screen Preview Styling */
    @media screen {
      .screen-bar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(10, 25, 47, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #233554;
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .slide-page {
        max-width: 1200px;
        min-height: 675px;
        aspect-ratio: 16 / 9;
        margin: 2rem auto;
        background-color: #0A192F;
        border: 1px solid #233554;
        border-radius: 1.25rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 2.5rem 3.5rem;
        position: relative;
        overflow: hidden;
      }
    }

    /* Print / PDF Export Styling (Exact A4 Landscape) */
    @media print {
      @page {
        size: A4 landscape;
        margin: 0;
      }
      .no-print, .screen-bar {
        display: none !important;
      }
      html, body {
        background-color: #070D19 !important;
      }
      .slide-page {
        width: 297mm !important;
        height: 210mm !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        break-after: page !important;
        break-inside: avoid !important;
        padding: 16mm 22mm !important;
        background-color: #0A192F !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        border: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        overflow: hidden !important;
      }
    }
  </style>
</head>
<body class="antialiased">
  <!-- Screen Navigation & Print Trigger Bar -->
  <div class="screen-bar no-print">
    <div class="flex items-center gap-3">
      <a href="./presentation.html" class="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 border border-navy-600 transition">
        <span>← Interactive Slides</span>
      </a>
      <span class="text-xs text-slate-400 hidden sm:inline">•</span>
      <span class="text-xs text-slate-300 font-mono hidden sm:inline">All 7 Slides Print Ready</span>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-[11px] text-cyan-400 font-mono hidden md:inline">
        💡 In Print Dialog: Set Destination to "Save as PDF" & Margins to "None"
      </span>
      <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition">
        <i data-lucide="printer" class="w-4 h-4"></i>
        <span>Save Entire Deck as PDF</span>
      </button>
    </div>
  </div>

  <div id="deck-pages"></div>

  <script>
${rawHtml.substring(rawHtml.indexOf('const SLIDES = ['), rawHtml.indexOf('let currentSlide = 0;'))}

    const container = document.getElementById('deck-pages');
    container.innerHTML = SLIDES.map((s, idx) => \`
      <div class="slide-page">
        <!-- Top Slide Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span class="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">\${s.category}</span>
          </div>
          <div class="text-xs font-mono text-slate-400">
            Slide <span class="text-white font-bold">\${idx + 1}</span> of \${SLIDES.length}
          </div>
        </div>

        <!-- Slide Body -->
        <div class="flex-1 flex flex-col justify-center my-auto">
          \${s.render()}
        </div>

        <!-- Slide Footer -->
        <div class="pt-3 border-t border-navy-600/60 flex items-center justify-between text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-medium">Startup ASEAN • Hacktoberfest KL 2026</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-cyan-400 font-semibold">
            ASEAN POC-Architect
          </div>
        </div>
      </div>
    \`).join('');

    if (window.lucide) {
      lucide.createIcons();
    }
  </script>
</body>
</html>`;

const outHtmlPath = path.join(process.cwd(), 'presentation', 'slides-printable.html');
fs.writeFileSync(outHtmlPath, printableHtml, 'utf8');
fs.writeFileSync(path.join(process.cwd(), 'public', 'slides-printable.html'), printableHtml, 'utf8');
console.log('Successfully updated presentation/slides-printable.html and public/slides-printable.html');
