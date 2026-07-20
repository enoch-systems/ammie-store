"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Plus, X, Upload, Camera } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"

interface ImageGalleryProps {
  images: string[]
  selectedImageIndex: number
  onSelectImage: (index: number) => void
  onUpdateImage: (index: number, value: string) => void
}

export default function ImageGallery({ images, selectedImageIndex, onSelectImage, onUpdateImage }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [showUploadOptions, setShowUploadOptions] = useState<number | null>(null)
  const [showMultipleUpload, setShowMultipleUpload] = useState(false)
  const singleFileRef = useRef<HTMLInputElement>(null)
  const multipleFileRef = useRef<HTMLInputElement>(null)
  // Captures which image slot ("main" = 0, or a thumbnail index) a single-file
  // upload is targeting. Replaces the old setTimeout + data-attribute hack,
  // which was the source of the main image not updating after upload.
  const pendingSourceIndex = useRef<number | null>(null)

  const compressImage = async (file: File): Promise<File> => {
    // Always run images through resize + compression before upload, rather
    // than only compressing files over a large threshold. Most phone
    // photos are 3-8MB at resolutions far higher than needed for a product
    // gallery — sending those straight to Cloudinary wastes upload
    // bandwidth, storage, and delivery bandwidth on every page view.
    const maxDimension = 1600 // plenty sharp for the on-page gallery/zoom
    const targetSize = 400 * 1024 // aim for ~400KB per image

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new window.Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let quality = 0.85
          let scale = 1

          const width = img.width
          const height = img.height

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              scale = maxDimension / width
            } else {
              scale = maxDimension / height
            }
          }

          canvas.width = Math.round(width * scale)
          canvas.height = Math.round(height * scale)

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'))
                  return
                }

                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })

                if (compressedFile.size > targetSize && quality > 0.5) {
                  quality -= 0.1
                  compress()
                  return
                }

                // Guard against the rare case where compression produced a
                // larger file than the original (can happen with already
                // heavily-compressed small source images) — keep whichever
                // is smaller.
                resolve(compressedFile.size < file.size ? compressedFile : file)
              },
              'image/jpeg',
              quality
            )
          }

          compress()
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
      }
    })
  }

  const handleFileUpload = async (files: FileList | null, sourceIndex: number | null, isMultiple: boolean = false) => {
    if (!files || files.length === 0) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxMultiple = 4

    setUploadError(null)

    // Keep files in the order they were selected. For multiple uploads,
    // only take the first 4 — extras are ignored even if more were selected.
    let filesArray = Array.from(files)
    let truncatedNotice: string | null = null
    if (isMultiple && filesArray.length > maxMultiple) {
      filesArray = filesArray.slice(0, maxMultiple)
      truncatedNotice = `Only the first ${maxMultiple} images were used — up to ${maxMultiple} images can be added at once.`
    }

    const processedFiles: File[] = []

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i]
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Please upload JPG, PNG, or WebP.')
        return
      }

      try {
        const processedFile = await compressImage(file)
        processedFiles.push(processedFile)
      } catch (error) {
        console.error('Error processing image:', error)
        setUploadError('Failed to process image. Please try another file.')
        return
      }
    }

    try {
      setUploading(true)
      setShowUploadOptions(null)
      setShowMultipleUpload(false)
      setUploadProgress({ current: 0, total: processedFiles.length })

      const uploadedUrls: string[] = []

      for (let i = 0; i < processedFiles.length; i++) {
        setUploadProgress({ current: i + 1, total: processedFiles.length })
        const url = await uploadToCloudinary(processedFiles[i])
        uploadedUrls.push(url)
      }

      if (isMultiple) {
        // Slots 1..(images.length - 1) are the additional-image slots
        // (index 0 is the main image, mirrored as thumbnail #1 in the UI).
        let uploadIndex = 1
        for (const url of uploadedUrls) {
          if (uploadIndex < images.length) {
            onUpdateImage(uploadIndex, url)
            uploadIndex++
          }
        }
        // If the main image slot is still empty, use the first uploaded
        // image as the main image so the main box is never left blank.
        if (!images[0] && uploadedUrls[0]) {
          onUpdateImage(0, uploadedUrls[0])
        }
      } else {
        if (sourceIndex === 0) {
          // Main image slot. Thumbnail #1 is a live mirror of this value in
          // the render below, so there's no separate slot to keep in sync.
          onUpdateImage(0, uploadedUrls[0])
        } else if (sourceIndex !== null && sourceIndex > 0) {
          onUpdateImage(sourceIndex, uploadedUrls[0])
          // If the main slot is empty, use this image as the main image
          // too, so it's never left blank.
          if (!images[0]) {
            onUpdateImage(0, uploadedUrls[0])
          }
        }
      }

      setUploadProgress(null)
      setUploadError(truncatedNotice)
      if (singleFileRef.current) singleFileRef.current.value = ''
      if (multipleFileRef.current) multipleFileRef.current.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const handleThumbnailClick = (index: number) => {
    setShowUploadOptions(index)
  }

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateImage(index, "")
  }

  // The additional (non-main) image slots — everything after index 0.
  const additionalImages = images.slice(1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 lg:gap-8 items-stretch">
        {/* Main Image */}
        <div className="flex flex-col gap-3 flex-1">
          <div
            className="relative w-full h-full rounded-3xl overflow-hidden bg-card boty-shadow flex items-center justify-center cursor-pointer"
            onClick={() => setShowUploadOptions(0)}
          >
            {images[0] ? (
              <>
                <Image
                  src={images[0]}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 boty-transition flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Change Image</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(0, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 boty-transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 hover:text-foreground boty-transition">
                <Plus className="w-10 h-10" />
                <span className="text-sm">Click to add an image</span>
              </div>
            )}
          </div>

          {uploadProgress && (
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress.current} of {uploadProgress.total}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 boty-transition"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Thumbnails — 5 total. The first one mirrors the main image
            (same src, clicking/deleting it acts on slot 0). The next 4
            are the distinct additional-image slots (indices 1-4). This
            column's natural height (5 thumbnails + gaps) is what the
            main image box stretches to match via items-stretch + h-full
            above. */}
        <div className="flex flex-col gap-4 shrink-0">
          {/* Thumbnail #1 — mirror of the main image */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowUploadOptions(0)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setShowUploadOptions(0)
              }
            }}
            className={`relative w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl overflow-hidden boty-transition flex items-center justify-center cursor-pointer ${
              selectedImageIndex === 0
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "opacity-60 hover:opacity-100"
            } ${images[0] ? "bg-transparent" : "bg-card border border-dashed border-border"}`}
          >
            {images[0] ? (
              <>
                <Image
                  src={images[0]}
                  alt="Thumbnail 1 (main image)"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleDelete(0, e)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 boty-transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <Plus className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Thumbnails #2-5 — the 4 additional image slots */}
          {additionalImages.map((img, index) => (
            <div
              key={index + 1}
              role="button"
              tabIndex={0}
              onClick={() => handleThumbnailClick(index + 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleThumbnailClick(index + 1)
                }
              }}
              className={`relative w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl overflow-hidden boty-transition flex items-center justify-center cursor-pointer ${
                selectedImageIndex === index + 1
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              } ${img ? "bg-transparent" : "bg-card border border-dashed border-border"}`}
            >
              {img ? (
                <>
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleDelete(index + 1, e)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 boty-transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <Plus className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Multiple — deliberately outside the items-stretch row above, so
          it never factors into the main image's height. It's just aligned
          under the thumbnail column via the same fixed width + right-justify. */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowMultipleUpload(true)}
          disabled={uploading}
          className="relative w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl overflow-hidden boty-transition flex items-center justify-center bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-[8px] text-primary font-medium leading-none">Add</span>
              <span className="text-[8px] text-primary font-medium leading-none">Multiple</span>
            </div>
          )}
        </button>
      </div>

      {uploadError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {showUploadOptions !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowUploadOptions(null)}>
          <div className="bg-card p-6 rounded-2xl boty-shadow max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-foreground mb-4">Add Image</h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  const sourceIdx = showUploadOptions
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.capture = 'environment'
                  input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, sourceIdx, false)
                  input.click()
                  setShowUploadOptions(null)
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  // Capture the target slot synchronously — no DOM attribute
                  // round-trip, no race with the change event.
                  pendingSourceIndex.current = showUploadOptions
                  setShowUploadOptions(null)
                  singleFileRef.current?.click()
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-background border border-border text-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => setShowUploadOptions(null)}
                className="w-full inline-flex items-center justify-center gap-2 bg-transparent text-muted-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMultipleUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMultipleUpload(false)}>
          <div className="bg-card p-6 rounded-2xl boty-shadow max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-foreground mb-2">Add Multiple Images</h3>
            <p className="text-sm text-muted-foreground mb-4">Select up to 4 images to add as thumbnails</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.capture = 'environment'
                  input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files, null, true)
                  input.click()
                  setShowMultipleUpload(false)
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Take Photos
              </button>
              <button
                type="button"
                onClick={() => {
                  multipleFileRef.current?.click()
                  setShowMultipleUpload(false)
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-background border border-border text-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Choose from Gallery
              </button>
              <button
                type="button"
                onClick={() => setShowMultipleUpload(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-transparent text-muted-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={singleFileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => {
          const sourceIdx = pendingSourceIndex.current ?? 0
          handleFileUpload(e.target.files, sourceIdx, false)
          pendingSourceIndex.current = null
        }}
        className="hidden"
      />
      <input
        ref={multipleFileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={(e) => handleFileUpload(e.target.files, null, true)}
        className="hidden"
      />
    </div>
  )
}