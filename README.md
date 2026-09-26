# Compare AI

Compare AI compares two to ten documents and returns an evidence-first matrix, key differences, clarifications, and potential risks. Supported inputs: PDF, DOCX, XLSX, XLS, CSV, TXT, and Markdown.

## Run on a customer laptop

The distributable is self-contained apart from calls to the selected AI provider. Parser libraries are vendored in `src/vendor`; the browser does not download executable libraries from a CDN.

- macOS/Linux: run `./run-local.sh` from the extracted project folder.
- Windows: double-click `run-local.bat` (Python 3 must be installed).
- Open <http://127.0.0.1:4173>.

The local server binds to loopback so other devices on the network cannot access the app through that server. Stop it with Ctrl+C in its terminal window. The files can also be served with `npm start` where Python 3 is available.

## AI key setup

Open **Settings**, paste an AI API key, and select **Save key in this browser**. The app detects supported key prefixes and chooses a provider and default model without putting provider selection in the comparison flow. If a legacy or new key format is ambiguous, the app does not send it anywhere; use the optional provider override in Advanced settings.

The key is stored unencrypted in this browser's local storage for the current site origin. It remains across reloads until removed in Settings or that origin's site data is cleared. Browser cache-only clearing may leave site storage intact. It is not included in project files, URLs, logs, or Git commits.

## Security and privacy

- Documents are parsed locally. Original file bytes are not uploaded to an application server.
- Extracted text and the API key are sent over HTTPS directly to exactly one selected AI provider when a comparison runs. Provider data handling and billing policies apply.
- The browser must use the key to call a provider, so frontend code cannot keep the key secret from the browser owner, extensions, developer tools, or compromised same-origin scripts. Local storage is not encryption. Use a restricted key with spending limits; remove it from Settings or clear site data when finished.
- Parser bundles are pinned and served locally. A Content Security Policy limits executable scripts to this origin and outbound connections to the supported provider API hosts.
- Never commit real API keys or document contents. The UI does not log keys; provider error text is redacted before display.
- Use HTTPS for cloud hosting. For a centrally managed service where users must not access credentials, add a same-origin backend/proxy and keep service credentials in a server-side secret manager. Do not put a shared key in this repository or browser bundle.
- Scanned image-only PDFs are not OCR processed. Each document is capped at 18,000 extracted characters.

## Cloud hosting

This static app can be hosted on GitHub Pages or another static host that serves the repository files over HTTPS. It needs no build step or server-side database. Browser key storage is origin-specific: a key saved on `localhost` is separate from one saved on a hosted domain or another browser profile. Direct provider calls may depend on each provider's CORS/browser-access policy.

See [docs/architecture.md](docs/architecture.md) for components, data flow, security boundaries, and production evolution guidance. See [src/vendor/README.md](src/vendor/README.md) for dependency versions and licenses.

## Supported providers

OpenAI, Anthropic, Google Gemini, and Moonshot/Kimi. The default model is maintained internally for each integration; no provider or model choice appears in the comparison flow. Some legacy key formats overlap, so those require the optional Advanced setting rather than an unsafe guess.

For cloud setup and laptop distribution details, see [docs/deployment.md](docs/deployment.md).
