/**
 * Every file-handling service (Phase 10) depends on this interface, never
 * on a concrete implementation. Today the only implementation is
 * LocalStorageProvider (writes to disk). If SyncRoot ever needs to move to
 * S3/MinIO for real production deployment, that's a new class implementing
 * this same interface — no service or controller code changes.
 */
export interface StoredFileRef {
  /** Opaque key the provider uses to locate the file. Store this in the DB, not a raw path/URL. */
  key: string;
  /** Size in bytes, as actually written — used to validate against client-reported size. */
  sizeBytes: number;
}

export interface StorageProvider {
  /** Persists a file and returns a reference to it. */
  save(params: { originalName: string; mimeType: string; buffer: Buffer }): Promise<StoredFileRef>;

  /** Reads a previously saved file back into memory. Fine for the file sizes this app expects; revisit if that changes. */
  read(key: string): Promise<Buffer>;

  /** Returns a URL (or route path) the client can use to fetch/download the file. */
  getUrl(key: string): string;

  /** Permanently removes a file. */
  delete(key: string): Promise<void>;
}
