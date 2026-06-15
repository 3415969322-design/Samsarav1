export type StorageProviderName = "local" | "r2" | "s3" | "supabase";

export type StorageVisibility = "private" | "public";

export type UploadObjectInput = {
  data: Blob | Buffer | Uint8Array;
  filename: string;
  contentType: string;
  visibility?: StorageVisibility;
  metadata?: Record<string, string>;
};

export type StoredObject = {
  provider: StorageProviderName;
  key: string;
  filename: string;
  contentType: string;
  size: number;
  visibility: StorageVisibility;
};

export type SignedUrlOptions = {
  expiresInSeconds?: number;
};

export type StoredObjectBody = StoredObject & {
  data: Buffer;
};

export interface StorageProvider {
  readonly name: StorageProviderName;
  upload(input: UploadObjectInput): Promise<StoredObject>;
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;
  delete(key: string): Promise<void>;
  getMetadata(key: string): Promise<StoredObject | null>;
  getObject(key: string): Promise<StoredObjectBody | null>;
}
