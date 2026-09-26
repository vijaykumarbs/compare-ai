# Deployment

Compare AI is a static web application. Its runtime files are in the repository; no build process or package installation is needed for end users.

## Customer laptop

1. Download and extract the repository or a release archive.
2. Start `run-local.sh` on macOS/Linux or `run-local.bat` on Windows.
3. Open `http://127.0.0.1:4173` in a supported browser.
4. Add the user's own AI API key in Settings.

Python 3 is required for the built-in local server. The server binds only to the local loopback interface. Keep the complete folder together so the HTML, ES modules, styles, and vendored parser bundles remain at their expected relative paths.

## Static cloud host

1. Host the repository root as static files on an HTTPS origin.
2. Preserve folder paths and relative asset paths. No backend environment variables or build step are required.
3. Open the hosted origin and save the user's own API key in Settings.
4. Check that the provider permits direct browser requests from that origin; if a provider blocks browser access, use a server-side adapter instead of widening the browser's network policy.

GitHub Pages is one option: configure the repository to deploy the `main` branch root in the repository's Pages settings. A new host is a different origin, so browser-stored credentials do not transfer from `localhost` or another hostname.

## Shared or managed deployments

This static client is appropriate for personal BYOK use. For a multi-user service or managed keys, add an authenticated, same-origin backend. Keep shared credentials in a server secret manager, authorize each request, enforce quotas and input/output limits, redact logs, and set a retention policy. Never embed a shared credential in `index.html`, JavaScript, environment variables that are bundled into frontend assets, or a public repository.
