"use client"

import { useState, useEffect, useRef } from "react"
import { Play } from "lucide-react"
import { getSafeVideoUrl } from "@/lib/cloudinary"

/**
 * Small self-contained thumbnail video that captures a frame for display.
 * Uses a hidden video element to extract a still image from the video.
 */
export function ThumbnailVideo({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string }) {
  const vidRef = useRef<HTMLVideoElement | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const safeUrl = getSafeVideoUrl(videoUrl)

  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return

    let captured = false

    const captureFrame = () => {
      if (captured) return
      try {
        if (vid.readyState < 2) {
          setTimeout(() => captureFrame(), 300)
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 120
        const ctx = canvas.getContext('2d')
        if (!ctx) { setReady(true); return }
        ctx.drawImage(vid, 0, 0, 160, 120)
        setThumbnail(canvas.toDataURL('image/jpeg', 0.8))
        captured = true
        setReady(true)
      } catch {
        setReady(true)
      }
    }

    const onCanPlay = () => { vid.currentTime = 0.1 }
    const onSeeked = () => captureFrame()
    const onError = () => setReady(true)
    const onLoaded = () => { if (vid.readyState >= 2) vid.currentTime = 0.1 }

    vid.addEventListener('canplay', onCanPlay)
    vid.addEventListener('seeked', onSeeked)
    vid.addEventListener('error', onError)
    vid.addEventListener('loadeddata', onLoaded)
    vid.load()

    const timeout = setTimeout(() => !captured && captureFrame(), 3000)
    return () => {
      vid.removeEventListener('canplay', onCanPlay)
      vid.removeEventListener('seeked', onSeeked)
      vid.removeEventListener('error', onError)
      vid.removeEventListener('loadeddata', onLoaded)
      clearTimeout(timeout)
    }
  }, [safeUrl])

  if (thumbnail) return <img src={thumbnail} alt="" className="w-full h-full object-cover" />
  if (posterUrl) return <img src={posterUrl} alt="" className="w-full h-full object-cover" />
  if (!ready) return <div className="w-full h-full bg-muted flex items-center justify-center"><Play className="w-6 h-6 text-muted-foreground" fill="currentColor" /></div>

  return (
    <video
      ref={vidRef}
      src={videoUrl}
      muted
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      className="absolute opacity-0 pointer-events-none"
      style={{ width: 1, height: 1 }}
    />
  )
}