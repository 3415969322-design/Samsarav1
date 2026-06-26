declare module "pdf-parse" {
  export type PdfParseResult = {
    info?: Record<string, unknown>;
    metadata?: unknown;
    numpages: number;
    numrender: number;
    text: string;
    version: string;
  };

  export default function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
}
