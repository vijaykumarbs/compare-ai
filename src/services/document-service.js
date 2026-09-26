import { MAX_CHARS_PER_DOCUMENT } from "../config.js";
import * as pdfjsLib from "../vendor/pdf.min.mjs";

/** Extracts supported files in the browser; no file bytes leave this device. */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("../vendor/pdf.worker.min.mjs", import.meta.url).toString();

function getExtension(name) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

export async function extractDocument(file) {
  const ext = getExtension(file.name);

  if (ext === "pdf") {
    return extractPdf(file);
  }

  if (ext === "docx") {
    return extractDocx(file);
  }

  if (ext === "xlsx" || ext === "xls") {
    return extractSpreadsheet(file);
  }

  if (ext === "csv" || ext === "txt" || ext === "md") {
    return extractText(file);
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

async function extractPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    cMapUrl: new URL("../vendor/cmaps/", import.meta.url).toString(),
    cMapPacked: true,
    standardFontDataUrl: new URL("../vendor/standard_fonts/", import.meta.url).toString()
  }).promise;

  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const text = content.items
      .map(item => item.str || "")
      .join(" ")
      .replace(/[ \t]+/g, " ")
      .trim();

    pages.push(`--- Page ${pageNumber} ---\n${text}`);
  }

  const text = pages.join("\n\n").trim();

  if (!text) {
    return {
      name: file.name,
      type: "pdf",
      text: "",
      truncated: false,
      warning: "No text was extracted. This may be a scanned/image-only PDF."
    };
  }

  return finalizeExtractedDocument(file.name, "pdf", text);
}

async function extractDocx(file) {
  const mammoth = globalThis.mammoth;
  if (!mammoth) throw new Error("The DOCX parser is unavailable. Reload the app and try again.");

  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value || "";

  return finalizeExtractedDocument(file.name, "docx", text);
}

async function extractSpreadsheet(file) {
  const XLSX = globalThis.XLSX;
  if (!XLSX) throw new Error("The spreadsheet parser is unavailable. Reload the app and try again.");

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true
  });

  const sections = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, {
      blankrows: false
    });

    sections.push(`--- Sheet: ${sheetName} ---\n${csv}`);
  }

  return finalizeExtractedDocument(
    file.name,
    getExtension(file.name),
    sections.join("\n\n")
  );
}

async function extractText(file) {
  const text = await file.text();
  return finalizeExtractedDocument(file.name, getExtension(file.name), text);
}

function finalizeExtractedDocument(name, type, rawText) {
  const cleaned = normalizeText(rawText);

  if (!cleaned) {
    return {
      name,
      type,
      text: "",
      truncated: false,
      warning: "No readable text was extracted."
    };
  }

  const truncated = cleaned.length > MAX_CHARS_PER_DOCUMENT;

  return {
    name,
    type,
    text: truncated
      ? cleaned.slice(0, MAX_CHARS_PER_DOCUMENT) +
        "\n\n[DOCUMENT TEXT TRUNCATED BY CLIENT]"
      : cleaned,
    truncated,
    warning: truncated
      ? `Text exceeded ${MAX_CHARS_PER_DOCUMENT.toLocaleString()} characters and was truncated.`
      : ""
  };
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n")
    .trim();
}
