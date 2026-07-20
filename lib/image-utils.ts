/**
 * Cloudinary image optimization utilities.
 *
 * Applies `f_auto,q_auto,w_XXX` transforms to any Cloudinary URL so that
 * images are served in the best format (WebP/AVIF) at the correct resolution.
 * Non-Cloudinary URLs are returned unchanged.
 */

const CLOUDINARY_BASE = "res.cloudinary.com"

/**
 * Returns an optimized Cloudinary URL with format auto-detection, quality
 * auto-detection, and an optional width constraint.
 *
 * @param url   The raw image URL (may already contain Cloudinary transforms)
 * @param width Desired maximum width in pixels (e.g. 400, 800, 1200).
 *              Omit to apply only f_auto + q_auto without resizing.
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url || url.startsWith("/")) return url // local/placeholder, skip
  if (!url.includes(CLOUDINARY_BASE)) return url

  const uploadMarker = "/upload/"
  const markerIndex = url.indexOf(uploadMarker)
  if (markerIndex === -1) return url

  const insertAt = markerIndex + uploadMarker.length

  // Check if transforms already exist between /upload/ and the next segment
  const afterUpload = url.slice(insertAt)
  const existingTransforms = afterUpload.match(/^[^/]*,/)

  // Build the transform string
  const transforms: string[] = []

  if (width) {
    transforms.push(`w_${width}`)
  }

  transforms.push("f_auto", "q_auto")

  const transformStr = transforms.join(",") + "/"

  if (existingTransforms) {
    // Replace existing transforms with ours
    const existingEnd = existingTransforms.index! + existingTransforms[0].length
    return url.slice(0, insertAt) + transformStr + afterUpload.slice(existingEnd)
  }

  // Insert fresh transforms
  return url.slice(0, insertAt) + transformStr + afterUpload
}

/**
 * Convenience presets for common image sizes in the app.
 */
export function getOptimizedProductImage(
  url: string,
  size: "thumbnail" | "card" | "detail" | "full" = "card"
): string {
  const widthMap: Record<typeof size, number> = {
    thumbnail: 150,
    card: 600,
    detail: 1200,
    full: 2000,
  }
  return getOptimizedImageUrl(url, widthMap[size])
}