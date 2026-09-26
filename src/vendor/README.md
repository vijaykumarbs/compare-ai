# Vendored browser libraries

These fixed-version browser bundles are served from this repository so the page does not execute parser code from a third-party CDN while it has access to a saved API key.

| File | Package | Version | License |
| --- | --- | --- | --- |
| `pdf.min.mjs`, `pdf.worker.min.mjs`, `cmaps/`, `standard_fonts/` | `pdfjs-dist` | 6.3.289 | Apache-2.0 (includes upstream font notices) |
| `mammoth.browser.min.js` | `mammoth` | 1.12.3 | BSD-2-Clause |
| `xlsx.full.min.js` | SheetJS Community Edition | 0.20.3 | Apache-2.0 |

License texts are included beside the bundles. Update each bundle and its license together, review the upstream release, and update this inventory when upgrading.
