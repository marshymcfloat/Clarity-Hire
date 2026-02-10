import { getDownloadUrl } from "@vercel/blob";

/**
 * Generate a signed URL for private blob access
 * @param blobUrl - The blob URL to sign
 * @param expiresIn - Expiry time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL with expiration
 */
export async function getSignedResumeUrl(
  blobUrl: string,
  expiresIn: number = 3600,
): Promise<string> {
  try {
    // Vercel Blob getDownloadUrl generates signed URLs for private blobs
    const signedUrl = await getDownloadUrl(blobUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL for resume");
  }
}

/**
 * Generate signed URLs for multiple blobs
 * @param blobUrls - Array of blob URLs to sign
 * @param expiresIn - Expiry time in seconds
 * @returns Array of signed URLs
 */
export async function generateSignedUrls(
  blobUrls: string[],
  expiresIn: number = 3600,
): Promise<string[]> {
  return Promise.all(blobUrls.map((url) => getSignedResumeUrl(url, expiresIn)));
}

/**
 * Check if a URL is a Vercel Blob URL
 * @param url - URL to check
 * @returns True if it's a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return (
    url.includes("blob.vercel-storage.com") ||
    url.includes("public.blob.vercel-storage.com")
  );
}
