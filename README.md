# Compare AI

Compare AI turns two to ten documents into an evidence-first comparison matrix, key differences, clarification items, and potential risks. It accepts PDF, DOCX, XLSX, XLS, CSV, TXT, and Markdown files.

## Run locally

Serve the project over HTTP (browser ES modules and PDF.js workers do not work reliably from `file://`):

```sh
npm start
```

Open <http://localhost:4173>.

## System design

The application is a static, browser-first system with explicit boundaries:

```text
Browser UI (index.html, styles.css, app.js)
  ├── Document service → PDF.js / Mammoth / SheetJS → normalized text
  └── Comparison service → prompt + provider adapter → JSON result
        ├── OpenAI-compatible APIs
        ├── Anthropic Messages API
        ├── Gemini generateContent API
        └── Moonshot API
```

See [docs/architecture.md](docs/architecture.md) for component responsibilities, data contracts, security boundaries, and the path to a server-backed deployment.

## Privacy and security

- Documents are parsed in the browser. The app does not upload original file bytes to an application server.
- Extracted text is sent to the AI provider selected by the user. Provider retention and processing terms apply.
- API keys stay in page memory and are not written to local storage. A browser-held key is still accessible to browser code and extensions; this BYOK prototype is not suitable for centrally managed production credentials.
- Use a trusted HTTPS origin. Third-party parsing libraries are currently loaded from pinned CDN versions; production deployments should self-host or integrity-pin these dependencies and establish a dependency update process.
- Scanned, image-only PDFs do not have OCR support.
- Each document is capped at 18,000 extracted characters before it is sent to the provider.

## Supported providers

OpenAI, Anthropic, Google Gemini, Moonshot/Kimi, and a custom OpenAI-compatible endpoint. Model names remain editable because provider availability changes.

## Deployment

The app can be hosted as static assets on any HTTPS static host. For a production SaaS, add an authenticated backend or serverless API that owns provider credentials, enforces quotas and request limits, validates provider output, and applies retention controls. Never put a shared provider secret in this repository or browser bundle.
