# ASEAN POC-Architect — AI Provider Setup & Configuration Guide

This guide provides step-by-step instructions to configure, verify, and run each supported AI provider in the **ASEAN POC-Architect Universal AI Gateway**.

---

## 1. Environment Variables Overview

Create a `.env.local` file in the project root by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Required Keys Summary

| Variable | Provider | Purpose | Required For Live Calls? |
| :--- | :--- | :--- | :--- |
| `GOOGLE_AI_API_KEY` | Google | Gemma 4 & Gemini models | Optional (if using Google) |
| `GEMINI_API_KEY` | Google | Alternative alias for Google API | Optional |
| `GROQ_API_KEY` | Groq | Ultra-fast LPU inference | Optional (if using Groq) |
| `GROQ_MODEL_ID` | Groq | Model ID (default: `llama-3.1-8b-instant`) | Optional |
| `OLLAMA_BASE_URL` | Ollama | Local inference host (default: `http://localhost:11434`) | Optional (if using Ollama) |
| `OLLAMA_DEFAULT_MODEL` | Ollama | Local model (default: `gemma2:2b`) | Optional |

> [!IMPORTANT]
> **No API keys are required for core demo functionality.** If zero keys are configured, the application automatically uses the **Deterministic Zero-Failure Demo Engine**, ensuring complete resilience without internet access.

---

## 2. Google Provider Setup (Google Gemma 4 / Gemini)

### Step 1: Obtain a Free API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** and select or create a Google Cloud project.
4. Copy your API key.

### Step 2: Configure Environment
In `.env.local`:
```bash
GOOGLE_AI_API_KEY=AIzaSy...your_actual_key_here
```

### Step 3: Verified Supported Models
- `gemma-4-31b-it` (Google Gemma 4 31B Open Weights — Recommended)
- `gemma-4-26b-a4b-it` (Google Gemma 4 26B Mixture-of-Experts)
- `gemini-2.0-flash` (High-speed cloud model fallback)

---

## 3. Groq Provider Setup (High-Speed Cloud Inference)

### Step 1: Obtain a Free API Key
1. Navigate to the [Groq Console](https://console.groq.com/).
2. Create an account or sign in with GitHub.
3. Go to **API Keys** and generate a new key.
4. Copy the API key (starts with `gsk_...`).

### Step 2: Configure Environment
In `.env.local`:
```bash
GROQ_API_KEY=gsk_...your_actual_key_here
GROQ_MODEL_ID=llama-3.1-8b-instant
```

### Critical API Finding on Groq:
> [!NOTE]
> Groq officially deprecated `gemma2-9b-it` in late 2025. The gateway automatically configures `llama-3.1-8b-instant` as the verified active production model, offering sub-second latencies (~400ms).

---

## 4. Local Ollama Provider Setup (On-Device Apple Silicon / Edge)

Ollama runs open-weights LLMs directly on your computer's CPU or Apple Silicon Metal GPU with **zero internet connection required** after model download.

### Step 1: Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com/download):
- **macOS**: Download the `.zip`, unzip and move `Ollama.app` to `/Applications`. Launch Ollama.
- Verify CLI in Terminal:
  ```bash
  ollama --version
  ```

### Step 2: Pull the Recommended Models
For a MacBook Pro M1 with 8GB RAM, run the following commands in Terminal one by one:

```bash
# 1. Google Gemma 2 (2B quantized) - Lightweight, fast reasoning (~1.6GB disk)
ollama pull gemma2:2b

# 2. Qwen 2.5 Coder (3B quantized) - Technical architecture & schema specialist (~2.0GB disk)
ollama pull qwen2.5-coder:3b
```

### Step 3: Verify Installed Models
Run:
```bash
ollama list
```
You should see:
```
NAME                 ID              SIZE      MODIFIED
gemma2:2b            b50d6c999e59    1.6 GB    ...
qwen2.5-coder:3b     2b049651e624    1.9 GB    ...
```

### Step 4: Configure Environment (Optional)
If running on the standard default port:
```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=gemma2:2b
```

---

## 5. Health Check Verification

The gateway provides a health verification endpoint that checks all providers without revealing API keys:

```bash
curl http://localhost:3000/api/ai/health
```

Example JSON Response:
```json
{
  "success": true,
  "timestamp": "2026-10-31T04:20:00.000Z",
  "providers": [
    {
      "providerId": "google",
      "providerName": "Google Gemma 4 (Cloud)",
      "status": "connected",
      "latencyMs": 842
    },
    {
      "providerId": "groq",
      "providerName": "Groq Cloud (High-Speed LPU)",
      "status": "connected",
      "latencyMs": 280
    },
    {
      "providerId": "ollama",
      "providerName": "Local Ollama (Edge / Air-Gap Compatible)",
      "status": "connected",
      "models": ["gemma2:2b", "qwen2.5-coder:3b"],
      "latencyMs": 14
    },
    {
      "providerId": "fallback",
      "providerName": "Verified Deterministic Backup (Zero-Failure Demo Engine)",
      "status": "connected",
      "latencyMs": 1
    }
  ]
}
```

Status Labels Explained:
- **`connected`**: Provider responded and passed authentication and availability checks.
- **`not_configured`**: Server environment variable (`GOOGLE_AI_API_KEY` or `GROQ_API_KEY`) is missing.
- **`unavailable`**: Provider API timed out, returned HTTP error, or local Ollama daemon is stopped.
