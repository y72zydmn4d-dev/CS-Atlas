export const LIBRARY_SCHEMA_VERSION = 2 as const;

export interface LinkPreviewMetadata {
  canonicalUrl?: string;
  title?: string;
  description?: string;
  siteName?: string;
  imageUrl?: string;
  manualImageUrl?: string;
  suppressImage?: boolean;
  faviconUrl?: string;
  author?: string;
  publishedAt?: string;
  fetchedAt?: string;
  status: "idle" | "loading" | "ready" | "partial" | "failed" | "manual";
  errorCode?: string;
  provider?: "youtube" | "github" | "website";
  providerLabel?: string;
}

export type LibraryItemType = "file" | "link";
export type LibraryFileFormat = "pdf" | "docx" | "markdown" | "text" | "other";
export type LibraryLanguage = "en" | "vi" | "mixed" | "unknown";
export type LibraryStatus = "ready" | "processing" | "failed" | "unsupported";
export type ExtractionStatus = "not-needed" | "pending" | "complete" | "partial" | "failed" | "unsupported";
export type LibraryEntityType = "domain" | "topic" | "algorithm" | "technique" | "project" | "module";
export type LibraryRelationKind = "primary" | "prerequisite" | "supplementary" | "example" | "exercise" | "reference";
export type LibraryErrorCode = "corrupt-file" | "encrypted-pdf" | "extraction-timeout" | "quota" | "storage" | "unsupported" | "unknown";

export interface LibraryRelation {
  entityType: LibraryEntityType;
  entityId: string;
  relation: LibraryRelationKind;
}

export interface LibraryItem {
  schemaVersion: typeof LIBRARY_SCHEMA_VERSION;
  id: string;
  type: LibraryItemType;
  title: string;
  description?: string;
  fileFormat?: LibraryFileFormat;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  fileLastModified?: number;
  fileFingerprint?: string;
  contentHash?: string;
  url?: string;
  canonicalUrl?: string;
  linkPreview?: LinkPreviewMetadata;
  sourceName?: string;
  authors?: string[];
  publishedAt?: string;
  importedAt: string;
  updatedAt: string;
  tags: string[];
  language?: LibraryLanguage;
  status: LibraryStatus;
  extractionStatus: ExtractionStatus;
  extractedText?: string;
  excerpt?: string;
  notes?: string;
  errorCode?: LibraryErrorCode;
  relatedEntities: LibraryRelation[];
}

export interface LibraryQuery {
  type?: LibraryItemType | "all";
  format?: LibraryFileFormat | "all";
  tag?: string;
  entityType?: LibraryEntityType;
  entityId?: string;
}

export interface CreateLibraryItemInput extends Omit<LibraryItem, "schemaVersion" | "id" | "importedAt" | "updatedAt"> {
  id?: string;
  file?: Blob;
}

export type UpdateLibraryItemInput = Partial<Omit<LibraryItem, "schemaVersion" | "id" | "importedAt">>;

export interface LibrarySearchResult {
  item: LibraryItem;
  score: number;
  context: string;
}

export interface ExtractionResult {
  status: Extract<ExtractionStatus, "complete" | "partial" | "failed" | "unsupported">;
  text: string;
  excerpt?: string;
  errorCode?: LibraryErrorCode;
}

export interface DocumentExtractor {
  supports(file: File): boolean;
  extract(file: File): Promise<ExtractionResult>;
}

export interface LibraryRepository {
  list(options?: LibraryQuery): Promise<LibraryItem[]>;
  get(id: string): Promise<LibraryItem | null>;
  create(input: CreateLibraryItemInput): Promise<LibraryItem>;
  update(id: string, patch: UpdateLibraryItemInput): Promise<LibraryItem>;
  remove(id: string): Promise<void>;
  getFile(id: string): Promise<Blob | null>;
  putFile(id: string, file: Blob): Promise<void>;
  search(query: string, limit?: number): Promise<LibrarySearchResult[]>;
  findDuplicate(input: { canonicalUrl?: string; fileFingerprint?: string; contentHash?: string }): Promise<LibraryItem | null>;
  exportMetadata(): Promise<{ schemaVersion: number; exportedAt: string; items: LibraryItem[] }>;
}
