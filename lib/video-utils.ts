import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<boolean> | null = null

/**
 * Convert a video file to MP4 format using FFmpeg WASM
 * This ensures browser compatibility for all uploaded videos
 */
export async function convertToMp4(file: File): Promise<File> {
  try {
    // Initialize FFmpeg if not already done
    if (!ffmpegInstance) {
      ffmpegInstance = new FFmpeg()
      
      // Load FFmpeg core (only once)
      if (!loadPromise) {
        loadPromise = ffmpegInstance.load({
          coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
          wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
        })
      }
      
      await loadPromise
    }

    const inputName = `input_${Date.now()}_${file.name}`
    const outputName = `output_${Date.now()}.mp4`

    // Write input file to FFmpeg memory
    await ffmpegInstance.writeFile(inputName, await fetchFile(file))

    // Convert to MP4 with browser-compatible codecs
    await ffmpegInstance.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputName
    ])

    // Read the output file
    const outputData = await ffmpegInstance.readFile(outputName)
    
    // Create a new File object from the converted data
    // Type assertion needed because FFmpeg returns Uint8Array
    const convertedBlob = new Blob([outputData as BlobPart], { type: 'video/mp4' })
    const convertedFile = new File([convertedBlob], outputName, { type: 'video/mp4' })

    // Clean up temporary files
    try {
      await ffmpegInstance.deleteFile(inputName)
      await ffmpegInstance.deleteFile(outputName)
    } catch (cleanupError) {
      console.warn('FFmpeg cleanup warning:', cleanupError)
    }

    return convertedFile
  } catch (error) {
    console.error('Video conversion failed:', error)
    // If conversion fails, return the original file
    // The upload function will handle unsupported formats
    return file
  }
}

/**
 * Check if a file is a video that needs conversion
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * Get video file extension
 */
export function getVideoExtension(file: File): string {
  const name = file.name.toLowerCase()
  const ext = name.split('.').pop() || ''
  return ext
}