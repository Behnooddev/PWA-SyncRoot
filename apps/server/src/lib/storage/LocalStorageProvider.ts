import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env.js";
import type { StorageProvider, StoredFileRef } from "@/lib/storage/StorageProvider.js";

/**
 * Writes uploaded files to a local directory. Keys are a random UUID plus
 * the original extension — never the user-supplied filename, to avoid path
 * traversal and collisions. The human-readable original name is preserved
 * separately in the File DB row, not in the storage key.
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly rootDir: string;

  constructor(rootDir: string = env.STORAGE_LOCAL_PATH) {
    this.rootDir = path.resolve(rootDir);
  }

  private async ensureRootExists(): Promise<void> {
    await mkdir(this.rootDir, { recursive: true });
  }

  private resolveKeyPath(key: string): string {
    const resolved = path.resolve(this.rootDir, key);
    if (!resolved.startsWith(this.rootDir)) {
      // Defence in depth against a malformed/malicious key, even though we generate keys ourselves.
      throw new Error("Resolved storage path escapes the storage root");
    }
    return resolved;
  }

  async save(params: {
    originalName: string;
    mimeType: string;
    buffer: Buffer;
  }): Promise<StoredFileRef> {
    await this.ensureRootExists();
    const ext = path.extname(params.originalName);
    const key = `${randomUUID()}${ext}`;
    await writeFile(this.resolveKeyPath(key), params.buffer);
    return { key, sizeBytes: params.buffer.byteLength };
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolveKeyPath(key));
  }

  getUrl(key: string): string {
    // Served via a dedicated download route (Phase 10), not a static file mount —
    // keeps file access behind the same auth/validation as every other endpoint.
    return `/api/files/${key}/download`;
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKeyPath(key), { force: true });
  }
}
