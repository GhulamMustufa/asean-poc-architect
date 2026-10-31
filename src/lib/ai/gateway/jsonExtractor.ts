/**
 * Safely extracts and parses JSON from raw LLM responses.
 * Handles markdown code blocks, escaped characters, and leading/trailing commentary.
 */
export function extractAndParseJson<T = any>(rawText: string): T {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Input to JSON extractor is empty or not a string.');
  }

  const trimmed = rawText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to extraction
  }

  // 2. Extract from markdown code fences: ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // Continue to bracket search
    }
  }

  // 3. Extract substring between first '{' and last '}'
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e: any) {
      throw new Error(`Failed to parse extracted JSON object: ${e?.message || e}`);
    }
  }

  // 4. Extract substring between first '[' and last ']'
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = trimmed.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch (e: any) {
      throw new Error(`Failed to parse extracted JSON array: ${e?.message || e}`);
    }
  }

  throw new Error('No valid JSON structure found in model output.');
}
