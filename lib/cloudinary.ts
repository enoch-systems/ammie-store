/**
 * Cloudinary upload utilities
 */

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"]

export function isVideoUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  // Cloudinary video URLs contain /video/ in the path
  if (lower.includes("/video/upload/")) return true
  // Check if it's a video file extension (could be just a filename)
  if (VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true
  // Also check if extension is in the URL
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext))
}

/**
 * Given a Cloudinary video URL, returns a static poster frame URL.
 * Simply changes /video/upload/ to /image/upload/ and adds f_auto,q_auto.
 */
export function getVideoPosterUrl(videoUrl: string): string {
  const lower = videoUrl.toLowerCase()
  const marker = "/video/upload/"
  const idx = lower.indexOf(marker)
  if (idx === -1) return videoUrl
  
  return `${videoUrl.slice(0, idx)}/image/upload/f_auto,q_auto/${videoUrl.slice(idx + marker.length)}`
}

/**
 * Applies bandwidth-saving transformations to a video URL.
 * - w_720: limit to 720p width
 * - q_40: aggressive quality compression
 * - sp_le: low-efficiency streaming profile (smaller files)
 * - f_auto: automatic format selection
 */
export function getOptimizedVideoUrl(videoUrl: string, width: number = 720, quality: number = 40): string {
  // If no URL or already has our transforms, return as-is to avoid double-transformation
  if (!videoUrl) return videoUrl
  
  // If URL doesn't contain /upload/, it's not a Cloudinary URL
  // Return it as-is (it might be a relative path or incomplete URL)
  const uploadMarker = "/upload/"
  const markerIndex = videoUrl.indexOf(uploadMarker)
  if (markerIndex === -1) return videoUrl
  
  const insertAt = markerIndex + uploadMarker.length
  const afterUpload = videoUrl.slice(insertAt)
  
  // Check if transforms already exist between /upload/ and the next segment
  // Transforms are comma-separated and end at the first slash
  const transformMatch = afterUpload.match(/^([^/]+)/)
  const existingTransforms = transformMatch && transformMatch[1].includes(',')
  
  const transforms = [`w_${width}`, `q_${quality}`, "sp_le", "f_auto"]
  
  if (existingTransforms) {
    // Replace existing transforms with ours
    const transformStr = transforms.join(",")
    const existingEnd = transformMatch[1].length
    const remaining = afterUpload.slice(existingEnd)
    // Ensure we don't create double slashes
    const cleanRemaining = remaining.startsWith('/') ? remaining : '/' + remaining
    return videoUrl.slice(0, insertAt) + transformStr + cleanRemaining
  }
  
  // Insert fresh transforms - ensure no double slashes
  const transformStr = transforms.join(",")
  const remaining = afterUpload
  const cleanRemaining = remaining.startsWith('/') ? remaining.slice(1) : remaining
  return videoUrl.slice(0, insertAt) + transformStr + "/" + cleanRemaining
}

/**
 * Get Cloudinary cloud name from environment or URL
 */
function getCloudinaryCloudName(): string | null {
  // Try environment variable first
  const envCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (envCloudName) return envCloudName
  
  // Common fallback - check if there's a default cloud name pattern
  // This helps during development when env vars might not be set
  return null
}

/**
 * Construct a full Cloudinary URL from a public ID or filename
 * Handles cases where only the filename/public ID is stored
 */
export function getFullCloudinaryVideoUrl(publicId: string): string {
  const cloudName = getCloudinaryCloudName()
  
  // If it's already a full URL, return as-is
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId
  }
  
  // If no cloud name configured, return as-is (will likely fail but at least we tried)
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured. Video URL:', publicId)
    return publicId
  }
  
  // Construct full Cloudinary URL
  // Remove any leading slashes or folder prefixes that might be in the public ID
  const cleanPublicId = publicId.replace(/^\/+/, '')
  
  return `https://res.cloudinary.com/${cloudName}/video/upload/${cleanPublicId}`
}

/**
 * Get a safe video URL that won't break if transformations fail
 * Returns the original URL if optimization fails
 */
export function getSafeVideoUrl(videoUrl: string): string {
  try {
    let url = videoUrl
    
    // If it's just a filename or public ID, construct full Cloudinary URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const fullUrl = getFullCloudinaryVideoUrl(url)
      if (fullUrl !== url) {
        url = fullUrl
      }
    }
    
    // If it's a Cloudinary URL, optimize it and force MP4 format
    if (url.includes('/upload/')) {
      // Force MP4 format by adding f_mp4 transform and changing extension
      // This ensures .mov files are served as MP4 which browsers can play
      const uploadMarker = '/upload/'
      const markerIndex = url.indexOf(uploadMarker)
      if (markerIndex !== -1) {
        const insertAt = markerIndex + uploadMarker.length
        const afterUpload = url.slice(insertAt)
        
        // Check if transforms already exist
        const transformMatch = afterUpload.match(/^([^/]+)/)
        const existingTransforms = transformMatch && transformMatch[1].includes(',')
        
        // Add f_mp4 to force MP4 format
        const transforms = [`w_720`, `q_40`, "sp_le", "f_auto", "f_mp4"]
        
        if (existingTransforms) {
          // Append f_mp4 to existing transforms
          const existingStr = transformMatch[1]
          const newTransforms = `${existingStr},f_mp4`
          const remaining = afterUpload.slice(transformMatch[1].length)
          const cleanRemaining = remaining.startsWith('/') ? remaining : '/' + remaining
          url = url.slice(0, insertAt) + newTransforms + cleanRemaining
        } else {
          // Insert fresh transforms
          const transformStr = transforms.join(",")
          const remaining = afterUpload
          const cleanRemaining = remaining.startsWith('/') ? remaining.slice(1) : remaining
          url = url.slice(0, insertAt) + transformStr + "/" + cleanRemaining
        }
        
        // Replace .mov extension with .mp4
        if (url.toLowerCase().endsWith('.mov')) {
          url = url.slice(0, -4) + '.mp4'
        }
      }
      
      return url
    }
    
    return url
  } catch (error) {
    console.error('Failed to optimize video URL:', error)
    return videoUrl
  }
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary configuration')
  }

  const isVideo = file.type.startsWith("video/")

  // Convert video to MP4 format if it's a video file
  let fileToUpload = file
  if (isVideo) {
    console.log('Converting video to MP4 format...')
    const { convertToMp4 } = await import('./video-utils')
    fileToUpload = await convertToMp4(file)
    console.log('Video converted successfully:', fileToUpload.type, fileToUpload.name)
  }

  const formData = new FormData()
  formData.append('file', fileToUpload)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'ammie-store/products')

  // Videos use a different Cloudinary upload endpoint
  const resourceType = isVideo ? "video" : "image"
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Failed to upload ${resourceType}`)
  }

  const data = await response.json()
  
  if (isVideo) {
    // For videos, apply bandwidth-saving transforms directly on upload
    // and return the optimized URL. We still store the base URL so future
    // transforms can be applied dynamically.
    return transformImageUrl(data.secure_url)
  }
  
  return transformImageUrl(data.secure_url)
}

/**
 * Insert Cloudinary transformation parameters into a URL.
 * Supports f_auto, q_auto, width, and any other valid Cloudinary transforms.
 * 
 * @param url - The base Cloudinary URL (from upload)
 * @param transforms - One or more transformation strings, e.g. "w_800", "f_auto,q_auto"
 * @returns The URL with transformations inserted after /upload/
 */
export function transformImageUrl(url: string, ...transforms: string[]): string {
  const uploadMarker = '/upload/'
  const markerIndex = url.indexOf(uploadMarker)
  if (markerIndex === -1) return url

  const transformStr = transforms.join(',')
  const insertAt = markerIndex + uploadMarker.length
  return `${url.slice(0, insertAt)}${transformStr}/${url.slice(insertAt)}`
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary configuration')
  }

  // Extract public ID from URL
  // URL format: https://res.cloudinary.com/{cloud}/image/upload/[transformations/]v{version}/{folder}/{filename}
  const publicId = extractPublicIdFromUrl(imageUrl)

  if (!publicId) {
    throw new Error('Invalid Cloudinary URL')
  }

  // Note: In production, you should use a backend API route for deletion
  // to avoid exposing your API secret. This is a simplified version.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_id: publicId,
        api_key: apiKey,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}

export function extractPublicIdFromUrl(url: string): string {
  const urlParts = url.split('/')
  const uploadIndex = urlParts.indexOf('upload')

  if (uploadIndex === -1) {
    return ''
  }

  // Everything after 'upload/' may include a transformation segment
  // (e.g. f_auto,q_auto) before the version/folder/filename. Transformation
  // segments always contain a comma, so skip that segment if present — the
  // public ID starts at the version segment (v1234567) or the folder path
  // if there's no version.
  let rest = urlParts.slice(uploadIndex + 1)
  if (rest[0] && rest[0].includes(',')) {
    rest = rest.slice(1)
  }

  return rest.join('/').split('.')[0]
}