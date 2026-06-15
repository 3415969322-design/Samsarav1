export const supportedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/markdown",
  "text/plain",
] as const;

export const supportedExtensions = [
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".md",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".txt",
  ".webp",
  ".xls",
  ".xlsx",
  ".zip",
] as const;

export function getFileExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");

  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
}

export function isSupportedFile(filename: string, mimeType: string) {
  return (
    supportedFileTypes.includes(mimeType as (typeof supportedFileTypes)[number]) ||
    supportedExtensions.includes(getFileExtension(filename) as (typeof supportedExtensions)[number])
  );
}

export function formatFileSize(size: bigint | number) {
  const bytes = typeof size === "bigint" ? Number(size) : size;
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function canPreviewInline(mimeType: string) {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}
