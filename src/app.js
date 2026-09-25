import { MAX_FILES, MIN_FILES, PROVIDERS } from "./config.js";
import { extractDocument } from "./services/document-service.js";
import { buildComparisonPrompt, callLLM, parseJsonResponse } from "./services/comparison-service.js";


let selectedFiles = [];
let extractedDocuments = [];
let lastResult = null;

// -----------------------------
// DOM
// -----------------------------

const providerEl = document.getElementById("provider");
const modelEl = document.getElementById("model");
const modelHelpEl = document.getElementById("modelHelp");
const apiKeyEl = document.getElementById("apiKey");
const endpointEl = document.getElementById("endpoint");
const endpointField = document.getElementById("endpointField");

const dropzone = document.getElementById("dropzone");
const chooseBtn = document.getElementById("chooseBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const fileCount = document.getElementById("fileCount");
const compareBtn = document.getElementById("compareBtn");
const clearBtn = document.getElementById("clearBtn");
const comparisonQuestion = document.getElementById("comparisonQuestion");

const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const summaryEl = document.getElementById("summary");
const dimensionBadge = document.getElementById("dimensionBadge");
const comparisonTable = document.getElementById("comparisonTable");
const differencesEl = document.getElementById("differences");
const clarificationsEl = document.getElementById("clarifications");
const risksEl = document.getElementById("risks");

const evidenceDrawer = document.getElementById("evidenceDrawer");
const drawerTitle = document.getElementById("drawerTitle");
const drawerBody = document.getElementById("drawerBody");
const drawerClose = document.getElementById("drawerClose");

// -----------------------------
// Provider settings
// -----------------------------

function updateProviderUI() {
  const provider = providerEl.value;
  const config = PROVIDERS[provider];

  if (!modelEl.value || modelEl.dataset.provider !== provider) {
    modelEl.value = config.defaultModel;
  }

  modelEl.dataset.provider = provider;
  modelHelpEl.textContent = config.help;

  endpointField.style.display = provider === "custom" ? "block" : "none";

  if (provider === "custom") {
    if (!endpointEl.value) endpointEl.value = config.endpoint;
  } else {
    endpointEl.value = config.endpoint;
  }
}

providerEl.addEventListener("change", updateProviderUI);

updateProviderUI();

// -----------------------------
// File upload
// -----------------------------

chooseBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  fileInput.click();
});

dropzone.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  fileInput.click();
});

dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  addFiles(Array.from(fileInput.files || []));
  fileInput.value = "";
});

["dragenter", "dragover"].forEach(type => {
  dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach(type => {
  dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  });
});

dropzone.addEventListener("drop", event => {
  addFiles(Array.from(event.dataTransfer.files || []));
});

function addFiles(files) {
  const supported = files.filter(isSupportedFile);

  for (const file of supported) {
    if (selectedFiles.length >= MAX_FILES) break;

    const duplicate = selectedFiles.some(
      existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    );

    if (!duplicate) selectedFiles.push(file);
  }

  renderFileList();
}

function isSupportedFile(file) {
  const ext = getExtension(file.name);
  return ["pdf", "docx", "xlsx", "xls", "csv", "txt", "md"].includes(ext);
}

function getExtension(name) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function renderFileList() {
  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const row = document.createElement("div");
    row.className = "file-row";

    const meta = document.createElement("div");
    meta.className = "file-meta";

    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;

    const info = document.createElement("div");
    info.className = "file-info";
    info.textContent = `${getExtension(file.name).toUpperCase()} · ${formatBytes(file.size)}`;

    meta.appendChild(name);
    meta.appendChild(info);

    const remove = document.createElement("button");
    remove.className = "remove-file";
    remove.type = "button";
    remove.title = "Remove file";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      renderFileList();
    });

    row.appendChild(meta);
    row.appendChild(remove);
    fileList.appendChild(row);
  });

  fileCount.textContent =
    `${selectedFiles.length} document${selectedFiles.length === 1 ? "" : "s"} selected`;

  compareBtn.disabled = selectedFiles.length < MIN_FILES;
}

// -----------------------------
// Local document extraction
// -----------------------------


// -----------------------------
// Comparison prompt
// -----------------------------
// -----------------------------
// Compare flow
// -----------------------------

compareBtn.addEventListener("click", compareDocuments);

async function compareDocuments() {
  if (selectedFiles.length < MIN_FILES) {
    showStatus(`Select at least ${MIN_FILES} documents.`, "error");
    return;
  }

  setLoading(true);
  resultsEl.classList.remove("show");

  try {
    showStatus("Reading documents locally…", "info");

    extractedDocuments = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      showStatus(
        `Reading ${i + 1} of ${selectedFiles.length}: ${file.name}`,
        "info"
      );

      const extracted = await extractDocument(file);
      extractedDocuments.push(extracted);
    }

    const emptyDocs = extractedDocuments.filter(doc => !doc.text);

    if (emptyDocs.length) {
      const names = emptyDocs.map(doc => doc.name).join(", ");
      throw new Error(
        `No readable text was extracted from: ${names}. Scanned/image-only PDFs are not supported in this V1.`
      );
    }

    showStatus("Preparing comparison…", "info");

    const prompt = buildComparisonPrompt(extractedDocuments, comparisonQuestion.value);

    showStatus(
      `Sending ${extractedDocuments.length} document${extractedDocuments.length === 1 ? "" : "s"} to ${PROVIDERS[providerEl.value].label}…`,
      "info"
    );

    const raw = await callLLM(prompt, { provider: providerEl.value, apiKey: apiKeyEl.value.trim(), model: modelEl.value.trim(), endpoint: endpointEl.value.trim() });

    showStatus("Rendering comparison…", "info");

    const result = parseJsonResponse(raw);

    validateResult(result);

    lastResult = result;
    renderResults(result);

    const warnings = extractedDocuments
      .filter(doc => doc.warning)
      .map(doc => `${doc.name}: ${doc.warning}`);

    if (warnings.length) {
      showStatus(
        "Comparison complete. " + warnings.join(" "),
        "success"
      );
    } else {
      showStatus("Comparison complete.", "success");
    }

    resultsEl.classList.add("show");
    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (error) {
    console.error(error);
    showStatus(formatError(error), "error");
  } finally {
    setLoading(false);
  }
}

function validateResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("The AI returned an invalid comparison object.");
  }

  if (!Array.isArray(result.dimensions)) {
    throw new Error("The AI response is missing comparison dimensions.");
  }

  if (!result.matrix || typeof result.matrix !== "object") {
    throw new Error("The AI response is missing the comparison matrix.");
  }
}

function formatError(error) {
  const message = error?.message || String(error);

  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return (
      "The browser could not reach the selected provider. " +
      "This can be caused by CORS, an invalid endpoint/key, a network blocker, " +
      "or opening the app from file://. Host the app over HTTPS and verify the provider's browser/API access requirements."
    );
  }

  return message;
}

function setLoading(loading) {
  compareBtn.disabled = loading || selectedFiles.length < MIN_FILES;

  if (loading) {
    compareBtn.innerHTML =
      `<span class="loading"><span class="spinner"></span> Comparing…</span>`;
  } else {
    compareBtn.textContent = "Compare documents";
  }
}

function showStatus(message, type = "info") {
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;
}

// -----------------------------
// Results rendering
// -----------------------------
function renderResults(result) {
  summaryEl.textContent = result.summary || "No summary returned.";

  const dimensions = Array.isArray(result.dimensions)
    ? result.dimensions
    : [];

  dimensionBadge.textContent =
    `${dimensions.length} dimension${dimensions.length === 1 ? "" : "s"}`;

  renderMatrix(result);
  renderDifferences(result.key_differences);
  renderListSection(
    clarificationsEl,
    result.needs_clarification,
    item => ({
      title: item.item || "Clarification needed",
      body: Array.isArray(item.documents)
        ? `Documents: ${item.documents.join(", ")}`
        : ""
    })
  );

  renderListSection(
    risksEl,
    result.risks,
    item => ({
      title: item.item || "Watch-out",
      body: item.basis || ""
    })
  );
}

function renderMatrix(result) {
  const dimensions = Array.isArray(result.dimensions)
    ? result.dimensions
    : [];

  const documentNames = Array.isArray(result.document_names) &&
    result.document_names.length
    ? result.document_names
    : inferDocumentNames(result.matrix);

  const thead = documentNames
    .map(name => `<th>${escapeHtml(name)}</th>`)
    .join("");

  let html = `
    <thead>
      <tr>
        <th class="dimension">Dimension</th>
        ${thead}
      </tr>
    </thead>
    <tbody>
  `;

  for (const dimension of dimensions) {
    html += `<tr>`;
    html += `<td class="dimension">${escapeHtml(dimension)}</td>`;

    for (const docName of documentNames) {
      const cell = result.matrix?.[dimension]?.[docName];

      if (!cell) {
        html += `<td class="cell"><span class="empty-cell">Not stated</span></td>`;
        continue;
      }

      const value = cell.value ?? "Not stated";
      const source = cell.source ?? "";
      const evidence = cell.evidence ?? "";

      html += `
        <td class="cell">
          <div class="value">${escapeHtml(value)}</div>
          ${source ? `<div class="source">${escapeHtml(source)}</div>` : ""}
          ${
            evidence
              ? `<button
                  class="evidence-btn"
                  type="button"
                  data-dimension="${escapeAttr(dimension)}"
                  data-document="${escapeAttr(docName)}"
                  data-source="${escapeAttr(source)}"
                  data-evidence="${escapeAttr(evidence)}"
                >View evidence</button>`
              : ""
          }
        </td>
      `;
    }

    html += `</tr>`;
  }

  html += `</tbody>`;

  comparisonTable.innerHTML = html;

  comparisonTable
    .querySelectorAll(".evidence-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        openEvidence({
          dimension: button.dataset.dimension,
          document: button.dataset.document,
          source: button.dataset.source,
          evidence: button.dataset.evidence
        });
      });
    });
}

function inferDocumentNames(matrix) {
  const names = new Set();

  Object.values(matrix || {}).forEach(row => {
    Object.keys(row || {}).forEach(name => names.add(name));
  });

  return Array.from(names);
}

function renderDifferences(items) {
  differencesEl.innerHTML = "";

  if (!Array.isArray(items) || !items.length) {
    differencesEl.innerHTML =
      `<div class="card"><p>No key differences were returned.</p></div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("strong");
    title.textContent = item.dimension || "Difference";

    const p = document.createElement("p");
    p.textContent =
      `${item.difference || ""}${item.implication ? "\n\nWhy it may matter: " + item.implication : ""}`;

    card.appendChild(title);
    card.appendChild(p);
    differencesEl.appendChild(card);
  });
}

function renderListSection(container, items, mapper) {
  container.innerHTML = "";

  if (!Array.isArray(items) || !items.length) {
    container.innerHTML =
      `<div class="card"><p>Nothing returned.</p></div>`;
    return;
  }

  const list = document.createElement("div");
  list.className = "cards";

  items.forEach(item => {
    const mapped = mapper(item);

    const card = document.createElement("div");
    card.className = "card";

    const strong = document.createElement("strong");
    strong.textContent = mapped.title;

    const p = document.createElement("p");
    p.textContent = mapped.body;

    card.appendChild(strong);
    card.appendChild(p);
    list.appendChild(card);
  });

  container.appendChild(list);
}

function openEvidence(data) {
  drawerTitle.textContent =
    `${data.document} · ${data.dimension}`;

  drawerBody.innerHTML = "";

  const sourceBlock = document.createElement("div");
  sourceBlock.className = "evidence-block";
  sourceBlock.innerHTML = `
    <div class="evidence-label">Source</div>
    <div>${escapeHtml(data.source || "Source not provided")}</div>
  `;

  const quoteBlock = document.createElement("div");
  quoteBlock.className = "evidence-block";
  quoteBlock.innerHTML = `
    <div class="evidence-label">Evidence</div>
    <p class="evidence-quote">${escapeHtml(data.evidence || "No evidence quote provided.")}</p>
  `;

  drawerBody.appendChild(sourceBlock);
  drawerBody.appendChild(quoteBlock);

  evidenceDrawer.classList.add("show");
}

drawerClose.addEventListener("click", closeEvidence);

evidenceDrawer.addEventListener("click", event => {
  if (event.target === evidenceDrawer) closeEvidence();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeEvidence();
});

function closeEvidence() {
  evidenceDrawer.classList.remove("show");
}

// -----------------------------
// Clear
// -----------------------------

clearBtn.addEventListener("click", () => {
  selectedFiles = [];
  extractedDocuments = [];
  lastResult = null;

  fileInput.value = "";
  comparisonQuestion.value = "";
  resultsEl.classList.remove("show");
  statusEl.className = "status";
  statusEl.textContent = "";

  renderFileList();
});

// -----------------------------
// Escaping
// -----------------------------

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

// Initial state.
renderFileList();
