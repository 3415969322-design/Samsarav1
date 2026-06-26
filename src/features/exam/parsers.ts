import crypto from "node:crypto";
import type { ParsedExamFile } from "@/features/exam/types";

const supportedExtensions = [".pdf", ".docx", ".txt"] as const;

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getExtension(filename: string) {
  const lower = filename.toLowerCase();

  return supportedExtensions.find((extension) => lower.endsWith(extension)) ?? "";
}

export function createContentHash(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function parseExamFile(file: File): Promise<ParsedExamFile> {
  const filename = file.name || "study-material";
  const mimeType = file.type || "application/octet-stream";
  const extension = getExtension(filename);

  if (!extension) {
    throw new Error("仅支持 PDF、DOCX 和 TXT 文件。");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let contentText = "";

  if (extension === ".pdf" || mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      contentText = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (
    extension === ".docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    contentText = result.value;
  } else {
    contentText = buffer.toString("utf8");
  }

  const normalizedText = normalizeText(contentText);

  if (normalizedText.length < 80) {
    throw new Error("资料文本过短，无法生成有效题库。");
  }

  return {
    contentText: normalizedText,
    filename,
    mimeType,
    size: file.size,
  };
}
