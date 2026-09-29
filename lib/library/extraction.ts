import { LIBRARY_CONFIG } from "@/lib/library/config";
import { blobToArrayBuffer, blobToText, detectFileFormat } from "@/lib/library/files";
import type { DocumentExtractor, ExtractionResult, LibraryErrorCode } from "@/lib/library/types";

function limitText(text: string): ExtractionResult {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  const partial = normalized.length > LIBRARY_CONFIG.maxExtractedCharacters;
  const limited = normalized.slice(0, LIBRARY_CONFIG.maxExtractedCharacters);
  return { status: partial ? "partial" : "complete", text: limited, excerpt: limited.slice(0, 320) };
}

const textExtractor: DocumentExtractor = {
  supports: (file) => /(?:\.txt|\.md|\.markdown)$/i.test(file.name) || file.type === "text/plain" || file.type === "text/markdown",
  async extract(file) { return limitText(await blobToText(file)); },
};

const docxExtractor: DocumentExtractor = {
  supports: (file) => /\.docx$/i.test(file.name) || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  async extract(file) {
    const mammoth = await import("mammoth/mammoth.browser");
    const result = await mammoth.extractRawText({ arrayBuffer: await blobToArrayBuffer(file) });
    return limitText(result.value);
  },
};

const pdfExtractor: DocumentExtractor = {
  supports: (file) => /\.pdf$/i.test(file.name) || file.type === "application/pdf",
  async extract(file) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    const task = pdfjs.getDocument({ data: new Uint8Array(await blobToArrayBuffer(file)) });
    const document = await task.promise;
    const pages: string[] = [];
    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
      if (pages.join("\n\n").length >= LIBRARY_CONFIG.maxExtractedCharacters) break;
    }
    await task.destroy();
    return limitText(pages.join("\n\n"));
  },
};

function errorCode(error: unknown): LibraryErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("password")) return "encrypted-pdf";
  if (message.includes("timeout")) return "extraction-timeout";
  if (message.includes("invalid") || message.includes("corrupt") || message.includes("zip")) return "corrupt-file";
  return "unknown";
}

async function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error("extraction-timeout")), milliseconds); })]);
  } finally { if (timer) clearTimeout(timer); }
}

export async function extractDocument(file: File): Promise<ExtractionResult> {
  const format = await detectFileFormat(file);
  const extractor = format === "pdf" ? pdfExtractor : format === "docx" ? docxExtractor : format === "text" || format === "markdown" ? textExtractor : null;
  if (!extractor || !extractor.supports(file)) return { status: "unsupported", text: "", errorCode: "unsupported" };
  try { return await withTimeout(extractor.extract(file), LIBRARY_CONFIG.extractionTimeoutMs); }
  catch (error) { return { status: "failed", text: "", errorCode: errorCode(error) }; }
}
