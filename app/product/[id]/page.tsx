"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Leaf, Heart, Award, Recycle, Star, Check, Play, Pause, Maximize2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { supabase, type Product } from "@/lib/supabase"
import { getOptimizedProductImage } from "@/lib/image-utils"
import { isVideoUrl, getOptimizedVideoUrl, getSafeVideoUrl, getVideoPosterUrl } from "@/lib/cloudinary"

const benefits = [
  { icon: Leaf, label: "100% Human Hair" },
  { icon: Heart, label: "Ethically Sourced" },
  { icon: Recycle, label: "Eco-Friendly" },
  { icon: Award, label: "Premium Quality" }
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

// ── Small self-contained thumbnail video (shows a real frame, no image-optimizer dependency) ──
function ThumbnailVideo({ videoUrl, posterUrl, existingThumbnail }: { videoUrl: string; posterUrl?: string; existingThumbnail?: string }) {
  const vidRef = useRef<HTMLVideoElement | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(existingThumbnail || null)
  const [ready, setReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const safeUrl = getSafeVideoUrl(videoUrl)

  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return

    let captured = false
    let captureAttempts = 0
    const maxAttempts = 3

    const captureFrame = () => {
      if (captured) return
      captureAttempts++

      try {
        // Ensure video has enough data
        if (vid.readyState < 2) {
          if (captureAttempts < maxAttempts) {
            setTimeout(() => captureFrame(), 500)
          } else {
            setReady(true)
          }
          return
        }

        // Must set crossOrigin before drawing to canvas
        try { vid.crossOrigin = 'anonymous' } catch (_) {}

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setReady(true)
          return
        }

        canvas.width = vid.videoWidth || 640
        canvas.height = vid.videoHeight || 480
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.9)
        setThumbnail(thumbnailUrl)
        captured = true
        setReady(true)
      } catch (err) {
        // If canvas is tainted (CORS), fall back to poster
        if (posterUrl) {
          // Just use poster — no canvas needed
          captured = true
          setReady(true)
        } else if (captureAttempts < maxAttempts) {
          setTimeout(() => captureFrame(), 500)
        } else {
          setReady(true)
        }
      }
    }

    const handleCanPlay = () => {
      vid.currentTime = 0.1
    }

    const handleSeeked = () => {
      captureFrame()
    }

    const handleError = () => {
      setHasError(true)
      setReady(true)
    }

    const handleLoadedData = () => {
      if (vid.readyState >= 2) {
        vid.currentTime = 0.1
      }
    }

    vid.addEventListener('canplay', handleCanPlay)
    vid.addEventListener('seeked', handleSeeked)
    vid.addEventListener('error', handleError)
    vid.addEventListener('loadeddata', handleLoadedData)

    vid.load()

    // Fallback: capture frame after timeout if events don't fire
    const timeout = setTimeout(() => {
      if (!captured) {
        captureFrame()
      }
    }, 2000)

    return () => {
      vid.removeEventListener('canplay', handleCanPlay)
      vid.removeEventListener('seeked', handleSeeked)
      vid.removeEventListener('error', handleError)
      vid.removeEventListener('loadeddata', handleLoadedData)
      clearTimeout(timeout)
    }
  }, [safeUrl, posterUrl])

  // Show captured thumbnail
  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
    )
  }

  // Show poster image if video failed to load
  if (hasError && posterUrl) {
    return (
      <img
        src={posterUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />
    )
  }

  // Show placeholder if video failed to load or is still loading
  if (hasError || !ready) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <Play className="w-6 h-6 text-muted-foreground" fill="currentColor" />
      </div>
    )
  }

  // Show video element (display:none but still rendering) while capturing frame
  return (
    <video
      ref={vidRef}
      src={safeUrl}
      muted
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      className="w-full h-full object-cover absolute opacity-0 pointer-events-none"
      style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}
    />
  )
}

// ── Video Player Component (self-contained, no external refs) ──
function VideoPlayer({ videoUrl, posterUrl, alt, onThumbnailChange }: { videoUrl: string; posterUrl: string; alt: string; onThumbnailChange?: (thumbnail: string) => void }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buffering, setBuffering] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [error, setError] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const vidRef = useRef<HTMLVideoElement | null>(null)

  // Get safe video URL to prevent 404/400 errors
  const safeVideoUrl = getSafeVideoUrl(videoUrl)

  // Generate thumbnail from video first frame
  const generateVideoThumbnail = useCallback(() => {
    const vid = vidRef.current
    if (!vid || !vid.videoWidth) return

    try {
      // Set crossOrigin before drawing to canvas to avoid tainted canvas error
      vid.crossOrigin = 'anonymous'
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = vid.videoWidth
      canvas.height = vid.videoHeight

      // Seek to 0.5 seconds to get a good frame
      const currentTime = vid.currentTime
      vid.currentTime = 0.5

      const captureFrame = () => {
        try {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height)
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.9)
          setVideoThumbnail(thumbnailUrl)
          // Share the captured thumbnail with parent so it can be used in the sidebar thumbnail
          if (onThumbnailChange && thumbnailUrl) {
            onThumbnailChange(thumbnailUrl)
          }
        } catch (err) {
          // If canvas is tainted, just use the poster image
          console.log('Cannot capture video frame due to CORS, using poster instead')
        }
        vid.currentTime = currentTime
      }

      const onSeeked = () => {
        captureFrame()
        vid.removeEventListener('seeked', onSeeked)
      }

      vid.addEventListener('seeked', onSeeked)

      // Fallback: capture current frame if seeked doesn't fire
      setTimeout(() => {
        captureFrame()
      }, 500)
    } catch (err) {
      console.error('Failed to generate thumbnail:', err)
    }
  }, [onThumbnailChange])

  // Preload video metadata on mount for instant playback
  useEffect(() => {
    const vid = vidRef.current
    if (!vid) return

    const handleLoadedData = () => {
      setLoading(false)
      setError(false)
      // Generate thumbnail from video first frame
      generateVideoThumbnail()
    }

    const handleWaiting = () => {
      setBuffering(true)
    }

    const handleCanPlay = () => {
      setBuffering(false)
    }

    const handlePlaying = () => {
      setBuffering(false)
    }

    const handleError = () => {
      setLoading(false)
      setError(true)
      console.error('Video failed to load:', safeVideoUrl)
    }

    vid.addEventListener('loadeddata', handleLoadedData)
    vid.addEventListener('waiting', handleWaiting)
    vid.addEventListener('canplay', handleCanPlay)
    vid.addEventListener('playing', handlePlaying)
    vid.addEventListener('error', handleError)

    // Start loading metadata immediately
    vid.load()

    return () => {
      vid.removeEventListener('loadeddata', handleLoadedData)
      vid.removeEventListener('waiting', handleWaiting)
      vid.removeEventListener('canplay', handleCanPlay)
      vid.removeEventListener('playing', handlePlaying)
      vid.removeEventListener('error', handleError)
    }
  }, [safeVideoUrl, generateVideoThumbnail])

  const handlePlay = async () => {
    const vid = vidRef.current
    if (!vid) return

    setHasInteracted(true)
    setError(false)
    
    // If video is still loading, show loading state
    if (loading) {
      setPlaying(true)
      vid.controls = true
      
      // Wait for video to be ready
      const tryPlay = async () => {
        try {
          await vid.play()
        } catch (error) {
          // If play fails, video is still loading
          // The loadeddata event will trigger and we can retry
          console.log('Video loading, will play when ready')
        }
      }
      
      tryPlay()
      return
    }

    // Video is loaded, resume from wherever it was left (vid.currentTime
    // is preserved automatically by the browser across pause/play).
    vid.controls = true
    setPlaying(true)
    
    const playPromise = vid.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error('Playback failed:', error)
        // If playback fails due to URL error, show error state
        if (error.name === 'NotSupportedError' || error.message.includes('404') || error.message.includes('400')) {
          setError(true)
          setPlaying(false)
        }
      })
    }
  }

  // Actually pause the media element (not just the UI state), so the
  // exact playback position is preserved for the next play.
  const handlePause = useCallback(() => {
    const vid = vidRef.current
    if (vid && !vid.paused) {
      vid.pause()
    }
    setPlaying(false)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* Video thumbnail (first frame) - only visible before first interaction */}
      {!hasInteracted && !error && (
        <div className="absolute inset-0 transition-opacity duration-300 opacity-100">
          {videoThumbnail ? (
            <Image
              src={videoThumbnail}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src={posterUrl}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>
      )}
      
      {/* Loading spinner — shown while video is buffering/loading */}
      {hasInteracted && loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Buffering indicator */}
      {playing && buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none">
          <div className="w-10 h-10 border-3 border-white/40 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state - show poster image */}
      {error && (
        <div className="absolute inset-0 z-20">
          <Image
            src={posterUrl}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center text-white p-4">
              <p className="text-sm mb-2">Video format not supported</p>
              <button
                onClick={() => {
                  setError(false)
                  setLoading(true)
                  if (vidRef.current) {
                    vidRef.current.load()
                  }
                }}
                className="px-4 py-2 bg-white/20 rounded-full text-xs hover:bg-white/30 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Play/Pause button overlay - only show before first interaction */}
      {!hasInteracted && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 boty-transition cursor-pointer z-10"
          onClick={handlePlay}
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 boty-transition pointer-events-none opacity-100">
            <Play className="w-7 h-7 text-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}
      
      {/* Video element - shows at original size with black bars */}
      <video
        ref={vidRef}
        className={`w-full h-full transition-opacity duration-300 ${hasInteracted && !error ? 'opacity-100' : 'opacity-0'}`}
        style={{ objectFit: 'contain', backgroundColor: 'black' }}
        preload="metadata"
        playsInline
        loop
        muted
        controls
        crossOrigin="anonymous"
        onPlay={() => {
          setBuffering(false)
          setPlaying(true)
        }}
        onPause={() => {
          // Sync the UI state when the native video pauses (e.g. user clicks
          // native controls, or browser auto-pauses). This preserves the exact
          // playback position so resuming starts from the same spot.
          setPlaying(false)
        }}
        onEnded={() => {
          // Video loop will restart it, but we need to reflect pause briefly
          // so the overlay thumbnail shows between loop cycles if needed.
          setPlaying(false)
          // Re-trigger play after a microtask to keep looping seamless
          setTimeout(() => {
            const v = vidRef.current
            if (v) {
              v.play().catch(() => {})
              setPlaying(true)
            }
          }, 50)
        }}
        onError={() => {
          console.error('Video element error for URL:', safeVideoUrl)
          setError(true)
          setLoading(false)
        }}
      >
        <source src={safeVideoUrl} />
        {/* Fallback: try original URL if optimized URL fails */}
        {safeVideoUrl !== videoUrl && (
          <source src={videoUrl} />
        )}
      </video>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addItem, setIsOpen } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [preloaded, setPreloaded] = useState(false)
  const [videoThumbnails, setVideoThumbnails] = useState<Record<number, string>>({})

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      
      if (data) {
        setProduct(data)
        if (data.sizes) {
          const sizesArray = data.sizes.split(',').map((s: string) => s.trim())
          if (sizesArray.length > 0) {
            setSelectedSize(sizesArray[0])
          }
        }
      }
    } catch (error: any) {
      if (!error || error.code !== 'PGRST116') {
        console.error('Error fetching product:', error)
      }
      router.push('/shop')
    } finally {
      setLoading(false)
    }
  }, [productId, router])

  const fetchSuggestions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .limit(4)

      if (error) throw error
      setSuggestions(data || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  useEffect(() => {
    if (productId) {
      fetchSuggestions()
    }
  }, [productId, fetchSuggestions])

  useEffect(() => {
    const channel = supabase
      .channel(`product-detail-changes-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `id=eq.${productId}`,
        },
        () => {
          fetchProduct()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId, fetchProduct])

  useEffect(() => {
    window.scrollTo(0, 0)
    setSelectedImageIndex(0)
    setPreloaded(false)
  }, [productId])

  const realImages = product
    ? product.images.filter((img) => img && img.trim() !== "")
    : []

  // Preload ALL product images in the background as soon as the product
  // loads, so clicking any thumbnail swaps instantly — no network wait.
  useEffect(() => {
    if (!product || preloaded) return
    const imgs = product.images.filter((img) => img && img.trim() !== "")
    if (imgs.length === 0) return

    let loaded = 0
    const total = imgs.length
    imgs.forEach((url) => {
      const img = new window.Image()
      img.src = getOptimizedProductImage(url, "detail")
      img.onload = () => {
        loaded++
        if (loaded === total) setPreloaded(true)
      }
      img.onerror = () => {
        loaded++
        if (loaded === total) setPreloaded(true)
      }
    })
  }, [product, preloaded])

  // Preload videos when they're about to be viewed (adjacent to current)
  useEffect(() => {
    if (!product || realImages.length === 0) return

    const currentIndex = selectedImageIndex
    const indicesToPreload = [
      currentIndex, // Current
      (currentIndex + 1) % realImages.length, // Next
      (currentIndex - 1 + realImages.length) % realImages.length, // Previous
    ]

    indicesToPreload.forEach((index) => {
      const imgUrl = realImages[index]
      if (!imgUrl || !isVideoUrl(imgUrl)) return

      // Preload video by creating a hidden video element
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = getSafeVideoUrl(imgUrl)
      video.load()
    })
  }, [product, selectedImageIndex, realImages])

  const thumbnailSlots = (() => {
    const slots = [...realImages]
    while (slots.length < 5) {
      slots.push("")
    }
    return slots.slice(0, 5)
  })()

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = () => {
    if (!product) return
    setIsAdded(true)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getOptimizedProductImage(realImages[0] || "/placeholder.svg", "card")
    })
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getOptimizedProductImage(realImages[0] || "/placeholder.svg", "card")
    })
    setIsOpen(true)
  }

  const goToPrevImage = () => {
    if (realImages.length === 0) return
    setSelectedImageIndex((prev) =>
      prev === 0 ? realImages.length - 1 : prev - 1
    )
  }

  const goToNextImage = () => {
    if (realImages.length === 0) return
    setSelectedImageIndex((prev) =>
      prev === realImages.length - 1 ? 0 : prev + 1
    )
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const delta = touchStartX.current - touchEndX.current
    const swipeThreshold = 50

    if (delta > swipeThreshold) {
      goToNextImage()
    } else if (delta < -swipeThreshold) {
      goToPrevImage()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const defaultDeliveryText =
    "Nationwide delivery in 5–7 business days. Lagos and Port Harcourt orders typically arrive in 2–3 business days. Returns are accepted within 7 days of delivery for unused items in original packaging — contact us to start a return."

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "delivery", title: "Delivery & Returns", content: defaultDeliveryText }
  ]

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Loading product...</div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen overflow-x-hidden">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-lg text-muted-foreground">Product not found</div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const sizesArray = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : []

  // JSON-LD structured data for Google rich snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} is a premium quality hair product from Ammie N.`,
    "image": realImages.map(img => getOptimizedProductImage(img, "detail")),
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Ammie N"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://ammiestore.com/product/${product.id}`,
      "priceCurrency": "NGN",
      "price": product.price.toString(),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "NGN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "DAY" }
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "NG"
        }
      }
    },
    "aggregateRating": product.review_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.review_count.toString()
    } : undefined
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-stretch">
                <div
                  className="relative flex-1 h-full rounded-3xl overflow-hidden bg-card boty-shadow group touch-pan-y aspect-[3/4]"
                  style={{ minHeight: '400px', maxHeight: '600px' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {isVideoUrl(realImages[selectedImageIndex] || "") ? (
                    <VideoPlayer
                      videoUrl={realImages[selectedImageIndex]}
                      posterUrl={getOptimizedProductImage(realImages[selectedImageIndex], "detail")}
                      alt={`${product.name} - Video ${selectedImageIndex + 1}`}
                      onThumbnailChange={(thumb) => {
                        setVideoThumbnails(prev => ({ ...prev, [selectedImageIndex]: thumb }))
                      }}
                    />
                  ) : (
                    <Image
                      src={getOptimizedProductImage(realImages[selectedImageIndex] || "/placeholder.svg", "detail")}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover boty-transition"
                      priority
                    />
                  )}
                </div>

                {realImages.length > 0 && (
                  <div className="flex flex-col gap-3 shrink-0">
                    {thumbnailSlots.map((img, index) =>
                      img ? (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl overflow-hidden boty-transition ${
                            selectedImageIndex === index
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          {isVideoUrl(img) ? (
                            <ThumbnailVideo 
                              videoUrl={img} 
                              posterUrl={getOptimizedProductImage(img, "thumbnail")}
                              existingThumbnail={videoThumbnails[index]}
                            />
                          ) : (
                            <Image
                              src={getOptimizedProductImage(img, "thumbnail")}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              fill
                              sizes="76px"
                              className="object-cover"
                            />
                          )}
                          {isVideoUrl(img) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/15 pointer-events-none">
                              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                <Play className="w-3 h-3 md:w-3.5 md:h-3.5 text-foreground ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                          )}
                        </button>
                      ) : (
                        <div
                          key={index}
                          className="w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl bg-card"
                        />
                      )
                    )}
                  </div>
                )}
              </div>

              {realImages.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {realImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full boty-transition ${
                        selectedImageIndex === index
                          ? "bg-primary w-6"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  Ammie Hair
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < product.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  {product.description || `${product.name} is a premium quality hair product designed to enhance your natural beauty and elevate your style`}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">₦{product.price.toLocaleString()}</span>
              </div>

              {sizesArray.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
                  <div className="flex gap-3">
                    {sizesArray.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-foreground hover:bg-card/80"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">Quantity</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow cursor-pointer ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-primary text-primary px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary hover:text-primary-foreground cursor-pointer"
                >
                  Buy Now
                </button>
              </div>

              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="group transition-all duration-500 ease-out opacity-100 scale-100">
                  <Link href={`/product/${suggestion.id}`}>
                    <div className="bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <Image
                          src={getOptimizedProductImage(suggestion.images[0] || "/placeholder.svg", "card")}
                          alt={suggestion.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover boty-transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 md:p-5 pb-4">
                        <h3 className="font-serif text-sm md:text-lg text-foreground mb-0.5 md:mb-1">{suggestion.name}</h3>
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <span className="text-xs md:text-base font-medium text-foreground">₦{suggestion.price.toLocaleString()}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[10px] md:text-xs tracking-wide boty-transition hover:bg-primary/90 boty-shadow"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}