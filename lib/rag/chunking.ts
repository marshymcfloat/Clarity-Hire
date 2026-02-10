import { prisma } from "../prisma";

/**
 * Chunk a resume into semantic sections
 * @param rawText - Parsed resume text
 * @param parsedDocId - ID of the ParsedDocument
 * @returns Array of created DocumentChunk records
 */
export async function chunkResume(
  rawText: string,
  parsedDocId: string,
): Promise<any[]> {
  // Detect sections in the resume
  const sections = detectSections(rawText);

  const chunks: any[] = [];

  for (const section of sections) {
    // Create chunks from section with overlap
    const sectionChunks = createChunksFromSection(
      section.content,
      section.type,
      parsedDocId,
      section.startPosition,
    );
    chunks.push(...sectionChunks);
  }

  // Save all chunks to database
  const savedChunks = await prisma.documentChunk.createMany({
    data: chunks,
  });

  // Return the created chunks
  const createdChunks = await prisma.documentChunk.findMany({
    where: { parsedDocId },
    orderBy: { position: "asc" },
  });

  return createdChunks;
}

/**
 * Detect sections in resume text
 * Common sections: Summary, Experience, Education, Skills, etc.
 */
function detectSections(text: string): Array<{
  type: string;
  content: string;
  startPosition: number;
}> {
  const sections: Array<{
    type: string;
    content: string;
    startPosition: number;
  }> = [];

  // Section headers patterns (case-insensitive)
  const sectionPatterns = [
    {
      type: "SUMMARY",
      regex: /^(summary|professional summary|about|profile|objective)/i,
    },
    {
      type: "EXPERIENCE",
      regex:
        /^(experience|work experience|employment|work history|professional experience)/i,
    },
    { type: "EDUCATION", regex: /^(education|academic|qualifications)/i },
    {
      type: "SKILLS",
      regex: /^(skills|technical skills|competencies|expertise)/i,
    },
    { type: "PROJECTS", regex: /^(projects|portfolio)/i },
    {
      type: "CERTIFICATIONS",
      regex: /^(certifications|certificates|licenses)/i,
    },
  ];

  const lines = text.split("\n");
  let currentSection: {
    type: string;
    content: string;
    startPosition: number;
  } | null = null;
  let currentPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line is a section header
    const matchedPattern = sectionPatterns.find((p) => p.regex.test(line));

    if (matchedPattern) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentSection.content.trim();
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      // Start new section
      currentSection = {
        type: matchedPattern.type,
        content: "",
        startPosition: currentPosition,
      };
    } else if (currentSection) {
      // Add line to current section
      currentSection.content += line + "\n";
    } else {
      // No section detected yet, treat as generic content
      if (!sections.length) {
        currentSection = {
          type: "HEADER",
          content: line + "\n",
          startPosition: 0,
        };
      }
    }

    currentPosition += line.length + 1;
  }

  // Add last section
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // If no sections detected, treat entire text as one chunk
  if (sections.length === 0) {
    sections.push({
      type: "FULL_TEXT",
      content: text,
      startPosition: 0,
    });
  }

  return sections;
}

/**
 * Create chunks from a section with overlap
 * Target: 500-1000 tokens per chunk, 50-token overlap
 */
function createChunksFromSection(
  content: string,
  sectionType: string,
  parsedDocId: string,
  basePosition: number,
): any[] {
  const CHARS_PER_TOKEN = 4; // Approximation
  const MAX_CHUNK_SIZE = 1000 * CHARS_PER_TOKEN; // ~4000 chars
  const MIN_CHUNK_SIZE = 500 * CHARS_PER_TOKEN; // ~2000 chars
  const OVERLAP_SIZE = 50 * CHARS_PER_TOKEN; // ~200 chars

  const chunks: any[] = [];

  // If content is small enough, create single chunk
  if (content.length <= MAX_CHUNK_SIZE) {
    chunks.push({
      parsedDocId,
      chunkText: content,
      sectionType,
      position: basePosition,
      chunkIndex: 0,
      metadata: { tokens: Math.ceil(content.length / CHARS_PER_TOKEN) },
    });
    return chunks;
  }

  // Split into overlapping chunks
  let currentPosition = 0;
  let chunkIndex = 0;

  while (currentPosition < content.length) {
    const endPosition = Math.min(
      currentPosition + MAX_CHUNK_SIZE,
      content.length,
    );

    // Try to break at sentence boundary
    let chunkEnd = endPosition;
    if (endPosition < content.length) {
      const lastPeriod = content.lastIndexOf(".", endPosition);
      const lastNewline = content.lastIndexOf("\n", endPosition);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > currentPosition + MIN_CHUNK_SIZE) {
        chunkEnd = breakPoint + 1;
      }
    }

    const chunkText = content.substring(currentPosition, chunkEnd).trim();

    if (chunkText) {
      chunks.push({
        parsedDocId,
        chunkText,
        sectionType,
        position: basePosition + currentPosition,
        chunkIndex,
        metadata: {
          tokens: Math.ceil(chunkText.length / CHARS_PER_TOKEN),
          hasOverlap: chunkIndex > 0,
        },
      });
    }

    // Move position forward (with overlap)
    currentPosition = chunkEnd - OVERLAP_SIZE;
    if (currentPosition >= content.length) break;
    chunkIndex++;
  }

  return chunks;
}
