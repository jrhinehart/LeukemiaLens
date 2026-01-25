/**
 * Text Chunking Utilities for Workers
 * 
 * Splits text into semantic chunks suitable for embedding and retrieval.
 */

export interface Chunk {
    id: string;
    chunkIndex: number;
    content: string;
    tokenCount: number;
}

// Configuration
const CHUNK_SIZE = 600;  // Target tokens per chunk
const CHUNK_OVERLAP = 100;  // Overlap tokens
const CHARS_PER_TOKEN = 4;  // Approximation

/**
 * Estimate token count from text length.
 */
function estimateTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Split text into paragraphs.
 */
function splitIntoParagraphs(text: string): string[] {
    return text.split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
}

/**
 * Split text into sentences.
 */
function splitIntoSentences(text: string): string[] {
    return text.split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

/**
 * Generate a UUID v4.
 */
function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Chunk text into overlapping segments.
 */
export function chunkText(text: string, documentId?: string): Chunk[] {
    const chunks: Chunk[] = [];
    const paragraphs = splitIntoParagraphs(text);

    let currentChunk: string[] = [];
    let currentTokens = 0;
    let chunkIndex = 0;

    for (const para of paragraphs) {
        const paraTokens = estimateTokens(para);

        // If single paragraph exceeds chunk size, split on sentences
        if (paraTokens > CHUNK_SIZE) {
            // Flush current chunk first
            if (currentChunk.length > 0) {
                const content = currentChunk.join('\n\n');
                chunks.push({
                    id: generateId(),
                    chunkIndex: chunkIndex++,
                    content,
                    tokenCount: estimateTokens(content)
                });
                currentChunk = [];
                currentTokens = 0;
            }

            // Split large paragraph into sentences
            const sentences = splitIntoSentences(para);
            let sentenceChunk: string[] = [];
            let sentenceTokens = 0;

            for (const sent of sentences) {
                const sentTokens = estimateTokens(sent);

                if (sentenceTokens + sentTokens > CHUNK_SIZE && sentenceChunk.length > 0) {
                    const content = sentenceChunk.join(' ');
                    chunks.push({
                        id: generateId(),
                        chunkIndex: chunkIndex++,
                        content,
                        tokenCount: estimateTokens(content)
                    });

                    // Keep overlap
                    const overlapCount = Math.ceil(sentenceChunk.length * 0.3);
                    sentenceChunk = sentenceChunk.slice(-overlapCount);
                    sentenceTokens = sentenceChunk.reduce((sum, s) => sum + estimateTokens(s), 0);
                }

                sentenceChunk.push(sent);
                sentenceTokens += sentTokens;
            }

            // Add remaining sentences to current chunk for potential merge
            if (sentenceChunk.length > 0) {
                currentChunk = [sentenceChunk.join(' ')];
                currentTokens = sentenceTokens;
            }
        }
        // Normal paragraph - add to current chunk
        else if (currentTokens + paraTokens > CHUNK_SIZE && currentChunk.length > 0) {
            const content = currentChunk.join('\n\n');
            chunks.push({
                id: generateId(),
                chunkIndex: chunkIndex++,
                content,
                tokenCount: estimateTokens(content)
            });

            // Start new chunk with overlap
            const overlapCount = Math.ceil(currentChunk.length * 0.3);
            currentChunk = currentChunk.slice(-overlapCount);
            currentChunk.push(para);
            currentTokens = currentChunk.reduce((sum, p) => sum + estimateTokens(p), 0);
        } else {
            currentChunk.push(para);
            currentTokens += paraTokens;
        }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
        const content = currentChunk.join('\n\n');
        chunks.push({
            id: generateId(),
            chunkIndex: chunkIndex++,
            content,
            tokenCount: estimateTokens(content)
        });
    }

    return chunks;
}

/**
 * Chunk an article's title and abstract for embedding.
 * Used for study-level semantic search.
 */
export function chunkArticle(title: string, abstract: string): Chunk[] {
    const fullText = `${title}\n\n${abstract}`;

    // For short articles, create a single chunk
    if (estimateTokens(fullText) <= CHUNK_SIZE) {
        return [{
            id: generateId(),
            chunkIndex: 0,
            content: fullText,
            tokenCount: estimateTokens(fullText)
        }];
    }

    // For longer articles, chunk the abstract
    return chunkText(fullText);
}
