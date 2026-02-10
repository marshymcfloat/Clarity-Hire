import mammoth from "mammoth";

/**
 * Parse a resume file and extract raw text
 * @param blobUrl - URL of the resume file in Vercel Blob
 * @param fileType - File type (pdf or docx)
 * @returns Extracted text content
 */
export async function parseResume(
  blobUrl: string,
  fileType: string,
): Promise<string> {
  try {
    // Download file from blob storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to download resume: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Parse based on file type
    let rawText: string;
    if (fileType.toLowerCase() === "pdf" || blobUrl.endsWith(".pdf")) {
      rawText = await parsePdf(buffer);
    } else if (fileType.toLowerCase() === "docx" || blobUrl.endsWith(".docx")) {
      rawText = await parseDocx(buffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Normalize text
    return normalizeText(rawText);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
}

/**
 * Parse PDF file
 * @param buffer - PDF file buffer
 * @returns Extracted text
 */
async function parsePdf(buffer: Buffer): Promise<string> {
  // @ts-ignore - pdf-parse has complex export structure
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

/**
 * Parse DOCX file
 * @param buffer - DOCX file buffer
 * @returns Extracted text
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Normalize extracted text
 * - Remove excessive whitespace
 * - Normalize line breaks
 * - Remove special characters that interfere with processing
 * @param text - Raw extracted text
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  return (
    text
      // Remove non-printable characters except newlines and tabs
      .replace(/[^\x20-\x7E\n\t]/g, "")
      // Normalize multiple spaces to single space
      .replace(/ +/g, " ")
      // Normalize multiple newlines to max 2
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace from each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Remove leading/trailing whitespace
      .trim()
  );
}
