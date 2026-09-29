import type { LibraryLanguage } from "@/lib/library/types";

export type LibraryIngestionStatus = "queued" | "extracting" | "complete" | "failed" | "cancelled";

export interface LibraryIngestionJob {
  id: string;
  itemId: string;
  sourceContentHash: string;
  status: LibraryIngestionStatus;
  extractor: { name: string; version: string };
  locale: LibraryLanguage;
  createdAt: string;
  updatedAt: string;
  errorCode?: string;
}

export interface LibraryIngestionJobRepository {
  enqueue(input: Pick<LibraryIngestionJob, "itemId" | "sourceContentHash" | "extractor" | "locale">): Promise<LibraryIngestionJob>;
  get(id: string): Promise<LibraryIngestionJob | null>;
  cancel(id: string): Promise<LibraryIngestionJob>;
}

export interface LibraryExtractionArtifact {
  jobId: string;
  itemId: string;
  sourceContentHash: string;
  extractor: { name: string; version: string };
  text: string;
  locale: LibraryLanguage;
  createdAt: string;
}

// This boundary deliberately has no embedding, vector-store, AI-provider, or
// canonical-content mutation capability. Those require separate consent/review.
