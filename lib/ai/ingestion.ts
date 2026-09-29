export type AiIngestionStatus = "pending" | "processing" | "ready" | "failed" | "deleted";

export interface LibraryIngestionRecord {
  id: string;
  libraryItemId: string;
  sourceChecksum: string;
  sourceVersion: string;
  extractorVersion: string;
  chunkerVersion: string;
  embeddingModel?: string;
  locale: string;
  status: AiIngestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryChunkRecord {
  id: string;
  ingestionId: string;
  ordinal: number;
  textChecksum: string;
  page?: number;
  startOffset?: number;
  endOffset?: number;
}

export interface LibraryEmbeddingRecord {
  chunkId: string;
  model: string;
  dimensions: number;
  vectorStoreKey: string;
  createdAt: string;
}

export interface LibraryIngestionJob {
  enqueue(input: { libraryItemId: string; sourceChecksum: string; consentReference: string }): Promise<{ jobId: string }>;
  getStatus(jobId: string): Promise<AiIngestionStatus | null>;
  deleteDerived(libraryItemId: string): Promise<void>;
}
