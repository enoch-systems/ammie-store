/**
 * Cloudinary upload utilities
 */

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary configuration')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'ammie-store/products')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to upload image')
  }

  const data = await response.json()
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