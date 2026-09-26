import { PROVIDERS } from "../config.js";

/**
 * Infer a provider only when the key has a provider-specific prefix.
 * Some legacy keys share formats; those must use the optional settings override.
 */
export function detectProvider(apiKey) {
  const key = String(apiKey || "").trim();

  if (/^sk-ant-[A-Za-z0-9_-]{10,}$/.test(key)) return "anthropic";
  if (/^AIza[0-9A-Za-z_-]{20,}$/.test(key)) return "gemini";
  if (/^sk-(?:proj|svcacct)-[A-Za-z0-9_-]{10,}$/.test(key)) return "openai";

  return null;
}

/** Resolve an explicit fallback only when automatic detection is inconclusive. */
export function resolveProvider(apiKey, override = "") {
  const detected = detectProvider(apiKey);
  if (detected) return { provider: detected, detected: true };

  if (override && Object.hasOwn(PROVIDERS, override)) {
    return { provider: override, detected: false };
  }

  return { provider: null, detected: false };
}
