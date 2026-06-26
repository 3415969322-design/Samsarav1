import crypto from "node:crypto";
import { inflateSync } from "node:zlib";
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

function decodePdfLiteralString(value: string) {
  return value
    .replace(/\\([nrtbf()\\])/g, (_, escaped: string) => {
      const escapes: Record<string, string> = {
        "(": "(",
        ")": ")",
        "\\": "\\",
        b: "\b",
        f: "\f",
        n: "\n",
        r: "\r",
        t: "\t",
      };

      return escapes[escaped] ?? escaped;
    })
    .replace(/\\([0-7]{1,3})/g, (_, octal: string) =>
      String.fromCharCode(Number.parseInt(octal, 8)),
    )
    .replace(/\\\r?\n/g, "");
}

function decodePdfHexString(value: string) {
  const clean = value.replace(/\s+/g, "");
  const padded = clean.length % 2 === 0 ? clean : `${clean}0`;
  const bytes = Buffer.from(padded, "hex");

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    const chars: string[] = [];

    for (let index = 2; index + 1 < bytes.length; index += 2) {
      chars.push(String.fromCharCode(bytes.readUInt16BE(index)));
    }

    return chars.join("");
  }

  return bytes.toString("utf8").replace(/\u0000/g, "");
}

function extractPdfTextFromContent(content: string) {
  const textBlocks = content.match(/BT[\s\S]*?ET/g) ?? [content];
  const fragments: string[] = [];

  for (const block of textBlocks) {
    for (const match of block.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
      fragments.push(decodePdfLiteralString(match[0].slice(1, -1)));
    }

    for (const match of block.matchAll(/<([0-9a-fA-F\s]{4,})>/g)) {
      fragments.push(decodePdfHexString(match[1]));
    }
  }

  return fragments.join(" ");
}

function extractPdfStreams(buffer: Buffer) {
  const binary = buffer.toString("latin1");
  const streams: string[] = [];
  const streamPattern = /<<(?:.|\n|\r)*?>>\s*stream\r?\n?([\s\S]*?)\r?\n?endstream/g;

  for (const match of binary.matchAll(streamPattern)) {
    const dictionary = match[0].slice(0, match[0].indexOf("stream"));
    const rawStream = Buffer.from(match[1], "latin1");

    if (dictionary.includes("/FlateDecode")) {
      try {
        streams.push(inflateSync(rawStream).toString("latin1"));
      } catch {
        streams.push(match[1]);
      }
    } else {
      streams.push(match[1]);
    }
  }

  return streams;
}

function parsePdfText(buffer: Buffer) {
  const streams = extractPdfStreams(buffer);
  const candidates = streams.length > 0 ? streams : [buffer.toString("latin1")];
  const text = candidates.map(extractPdfTextFromContent).join("\n\n");

  return normalizeText(text);
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
    contentText = parsePdfText(buffer);
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
