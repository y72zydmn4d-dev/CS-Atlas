export const LIBRARY_CONFIG = {
  databaseName: "cs-atlas-library",
  databaseVersion: 2,
  previewHtmlBytes: 512_000,
  previewTimeoutMs: 6_000,
  previewMaxRedirects: 3,
  maxFileBytes: 25 * 1024 * 1024,
  maxFilesPerImport: 10,
  maxExtractedCharacters: 500_000,
  previewCharacters: 80_000,
  searchBodyCharacters: 100_000,
  extractionTimeoutMs: 20_000,
  searchResultLimit: 30,
} as const;

export const SUPPORTED_FILE_ACCEPT = ".pdf,.docx,.md,.markdown,.txt,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
