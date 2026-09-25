/** Application limits and provider metadata. Keep secrets out of this module. */
export const MAX_FILES = 10;
export const MIN_FILES = 2;
export const MAX_CHARS_PER_DOCUMENT = 18000;

export const PROVIDERS =  {
  openai: {
    label: "OpenAI API",
    defaultModel: "gpt-4.1-mini",
    help: "Use an OpenAI API model available to your API account.",
    endpoint: "https://api.openai.com/v1/chat/completions"
  },

  anthropic: {
    label: "Anthropic / Claude",
    // Active model according to Anthropic's current model lifecycle docs.
    defaultModel: "claude-sonnet-4-6",
    help: "Use an Anthropic API model available to your API account.",
    endpoint: "https://api.anthropic.com/v1/messages"
  },

  gemini: {
    label: "Google Gemini API",
    defaultModel: "gemini-3.8-flash",
    help: "Use a Gemini API model available to your Google AI account.",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
  },

  kimi: {
    label: "Moonshot / Kimi",
    // Keep this editable because Moonshot model availability can change.
    defaultModel: "kimi-k2.5",
    help: "Use a Moonshot model available to your Kimi API account. If your account uses another model, edit this field.",
    endpoint: "https://api.moonshot.ai/v1/chat/completions"
  },

  custom: {
    label: "Custom OpenAI-compatible",
    defaultModel: "",
    help: "Enter the exact model name and full chat-completions endpoint used by your provider.",
    endpoint: ""
  }
};
