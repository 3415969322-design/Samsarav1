import { FileArchive, FileSpreadsheet, FileText, ImageIcon, Presentation } from "lucide-react";
import { T } from "@/components/i18n/text";
import { canPreviewInline } from "@/features/files/types";

function renderFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-12 w-12 text-muted" />;
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-12 w-12 text-muted" />;
  }

  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) {
    return <Presentation className="h-12 w-12 text-muted" />;
  }

  if (mimeType.includes("zip")) {
    return <FileArchive className="h-12 w-12 text-muted" />;
  }

  return <FileText className="h-12 w-12 text-muted" />;
}

export function FilePreview({
  file,
}: {
  file: {
    filename: string;
    id: string;
    mimeType: string;
  };
}) {
  const contentUrl = `/api/files/${file.id}/content`;

  if (file.mimeType.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={file.filename}
        className="max-h-[28rem] w-full rounded-md border border-line object-contain"
        src={contentUrl}
      />
    );
  }

  if (file.mimeType === "application/pdf") {
    return (
      <iframe
        className="h-[32rem] w-full rounded-md border border-line"
        src={contentUrl}
        title={file.filename}
      />
    );
  }

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-line bg-background p-8 text-center">
      {renderFileIcon(file.mimeType)}
      <p className="mt-4 font-medium">{file.filename}</p>
      <p className="mt-2 text-sm text-muted">
        {canPreviewInline(file.mimeType)
          ? <T k="files.previewAvailable" />
          : <T k="files.previewUnavailable" />}
      </p>
    </div>
  );
}
