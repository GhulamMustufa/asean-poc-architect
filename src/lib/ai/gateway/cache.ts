import crypto from 'crypto';

export interface CacheEntry<T = any> {
  key: string;
  taskType: string;
  data: T;
  cachedAt: string;
  providerId: string;
  modelId: string;
  inputSummary: string;
}

class GatewayCache {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Generates a deterministic hash key based on task, challenge, startup, and schema version.
   */
  generateKey(
    taskType: string,
    challengeSignature: string,
    startupSignature: string,
    schemaVersion: string = 'v1'
  ): string {
    const raw = `${taskType}|${challengeSignature}|${startupSignature}|${schemaVersion}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry as CacheEntry<T>;
  }

  set<T>(
    key: string,
    taskType: string,
    data: T,
    providerId: string,
    modelId: string,
    inputSummary: string,
    isSensitiveData: boolean = false
  ): void {
    // Safety constraint: Never cache sensitive customer/banking data
    if (isSensitiveData) {
      return;
    }

    this.cache.set(key, {
      key,
      taskType,
      data,
      cachedAt: new Date().toISOString(),
      providerId,
      modelId,
      inputSummary
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const gatewayCache = new GatewayCache();
