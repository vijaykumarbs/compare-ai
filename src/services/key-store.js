/** Storage keys are versioned so a future migration can avoid overwriting data. */
const API_KEY_STORAGE = "compare-ai.api-key.v1";
const PROVIDER_STORAGE = "compare-ai.provider-override.v1";

/** Read credentials once at startup; callers must never log or render the key. */
export function loadSavedSettings() {
  try {
    return {
      apiKey: localStorage.getItem(API_KEY_STORAGE) || "",
      providerOverride: localStorage.getItem(PROVIDER_STORAGE) || "",
      storageAvailable: true
    };
  } catch {
    return { apiKey: "", providerOverride: "", storageAvailable: false };
  }
}

/** Persist the user's own key in this browser profile for this site origin. */
export function saveApiKey(apiKey) {
  localStorage.setItem(API_KEY_STORAGE, apiKey);
}

/** Remove the stored key and its optional ambiguity override. */
export function removeSavedSettings() {
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(PROVIDER_STORAGE);
}

/** Save only a provider identifier; never save a copy of the API key here. */
export function saveProviderOverride(provider) {
  if (provider) localStorage.setItem(PROVIDER_STORAGE, provider);
  else localStorage.removeItem(PROVIDER_STORAGE);
}

export const storageKeys = Object.freeze({ API_KEY_STORAGE, PROVIDER_STORAGE });
