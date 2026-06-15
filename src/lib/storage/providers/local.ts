import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  SignedUrlOptions,
  StorageProvider,
  StoredObjectBody,
  StoredObject,
  UploadObjectInput,
} from "@/lib/storage/types";

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local" as const;

  constructor(private readonly rootDir: string) {}

  private getRootPath() {
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), this.rootDir);
  }

  private getObjectPath(key: string) {
    const rootPath = this.getRootPath();
    const objectPath = path.resolve(rootPath, key);

    if (objectPath !== rootPath && !objectPath.startsWith(`${rootPath}${path.sep}`)) {
      throw new Error("Invalid storage key.");
    }

    return objectPath;
  }

  async upload(input: UploadObjectInput): Promise<StoredObject> {
    const now = new Date();
    const objectDirectory = path.join(
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
    );
    const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = path.join(objectDirectory, `${randomUUID()}-${safeFilename}`);
    const objectPath = this.getObjectPath(key);
    const data =
      input.data instanceof Blob
        ? Buffer.from(await input.data.arrayBuffer())
        : Buffer.from(input.data);

    await mkdir(path.dirname(objectPath), { recursive: true });
    await writeFile(objectPath, data);

    return {
      contentType: input.contentType,
      filename: input.filename,
      key,
      provider: this.name,
      size: data.byteLength,
      visibility: input.visibility ?? "private",
    };
  }

  async getSignedUrl(
    key: string,
    options?: SignedUrlOptions,
  ): Promise<string> {
    void options;

    return `/api/files/object?key=${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    await rm(this.getObjectPath(key), { force: true });
  }

  async getMetadata(key: string): Promise<StoredObject | null> {
    try {
      const objectStats = await stat(this.getObjectPath(key));

      return {
        contentType: "application/octet-stream",
        filename: path.basename(key),
        key,
        provider: this.name,
        size: objectStats.size,
        visibility: "private",
      };
    } catch {
      return null;
    }
  }

  async getObject(key: string): Promise<StoredObjectBody | null> {
    const metadata = await this.getMetadata(key);

    if (!metadata) {
      return null;
    }

    return {
      ...metadata,
      data: await readFile(this.getObjectPath(key)),
    };
  }
}
