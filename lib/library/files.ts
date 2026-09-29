import { LIBRARY_CONFIG } from "@/lib/library/config";
import type { LibraryFileFormat } from "@/lib/library/types";

const mimeFormats: Record<string, LibraryFileFormat> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/markdown": "markdown",
  "text/x-markdown": "markdown",
  "text/plain": "text",
};

export function extensionOf(name: string) {
  const clean = safeFileName(name);
  const index = clean.lastIndexOf(".");
  return index > 0 ? clean.slice(index + 1).toLowerCase() : "";
}

export function safeFileName(name: string) {
  return (name.normalize("NFC").split(/[\\/]/).pop() ?? "document").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255) || "document";
}

export function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result as ArrayBuffer); reader.onerror = () => reject(reader.error); reader.readAsArrayBuffer(blob); });
}

export function blobToText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") return blob.text();
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result ?? "")); reader.onerror = () => reject(reader.error); reader.readAsText(blob); });
}

export async function detectFileFormat(file: File): Promise<LibraryFileFormat> {
  const mime = mimeFormats[file.type.toLowerCase()];
  const extension = extensionOf(file.name);
  const bytes = new Uint8Array(await blobToArrayBuffer(file.slice(0, 8)));
  const pdfSignature = bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  const zipSignature = bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2]);
  if (pdfSignature) return "pdf";
  if (zipSignature && (extension === "docx" || mime === "docx")) return "docx";
  if (extension === "md" || extension === "markdown" || mime === "markdown") return "markdown";
  if (extension === "txt" || mime === "text") return "text";
  if (extension === "pdf" || extension === "docx") return "other";
  return mime ?? "other";
}

export function fileFingerprint(file: Pick<File, "name" | "size" | "lastModified">) {
  return `${file.name.normalize("NFC")}::${file.size}::${file.lastModified}`;
}

export async function hashFile(file: Blob): Promise<string | undefined> {
  if (!globalThis.crypto?.subtle || file.size > LIBRARY_CONFIG.maxFileBytes) return undefined;
  const digest = await globalThis.crypto.subtle.digest("SHA-256", await blobToArrayBuffer(file));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function formatBytes(value?: number) {
  if (value === undefined) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}
