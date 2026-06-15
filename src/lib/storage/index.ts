import { env } from "@/lib/config/env";
import type { StorageProvider } from "@/lib/storage/types";
import { LocalStorageProvider } from "@/lib/storage/providers/local";

export function createStorageProvider(): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case "local":
      return new LocalStorageProvider(env.LOCAL_STORAGE_ROOT);
    case "r2":
    case "s3":
    case "supabase":
      throw new Error(
        `${env.STORAGE_PROVIDER} storage is reserved for a future provider implementation.`,
      );
  }
}

export const storageProvider = createStorageProvider();
