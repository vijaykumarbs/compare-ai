/** Product limits shared by the upload controller and local parser. */
export const MAX_FILES = 10;
export const MIN_FILES = 2;
export const MAX_CHARS_PER_DOCUMENT = 18000;

/**
 * Provider endpoints and defaults stay in one place so the request adapter
 * does not need to know about UI controls or persistent credentials.
 */
export const PROVIDERS = Object.freeze({
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4.1-mini",
    endpoint: "https://api.openai.com/v1/chat/completions"
  },
  anthropic: {
    label: "Anthropic",
    defaultModel: "claude-sonnet-4-6",
    endpoint: "https://api.anthropic.com/v1/messages"
  },
  gemini: {
    label: "Google Gemini",
    defaultModel: "gemini-3.8-flash",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
  },
  kimi: {
    label: "Moonshot / Kimi",
    defaultModel: "kimi-k2.5",
    endpoint: "https://api.moonshot.ai/v1/chat/completions"
  }
});
