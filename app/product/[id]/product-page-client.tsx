"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Leaf, Heart, Award, Recycle, Star, Check, Play, Pause, Maximize2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { supabase, type Product } from "@/lib/supabase"
import { getOptimizedProductImage } from "@/lib/image-utils"
import { isVideoUrl, getOptimizedVideoUrl, getHlsVideoUrl, getSafeVideoUrl, getVideoPosterUrl, getConnectionQuality, isDataSaverMode } from "@/lib/cloudinary"

const benefits = [
  { icon: Leaf, label: "100% Human Hair" },
  { icon: Heart, label: "Ethically Sourced" },
  { icon: Recycle, label: "Eco-Friendly" },
  { icon: Award, label: "Premium Quality" }
]

type AccordionSection = "details" | "howToUse" | "ingredients" | "delivery"

// ── Small self-contained thumbnail video (shows a real frame, no image-optimizer dependency) ──
function ThumbnailVideo({ videoUrl, posterUrl }: { videoUrl: string; posterUrl?: string }) {
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

// ── HLS Video Player with Adaptive Bitrate Streaming ──
//
// Uses hls.js to play HLS streams from Cloudinary with automatic
// quality switching based on real-time network bandwidth.
//
// Behavior by connection type:
//   - 2G / Data Saver: Shows poster only, no video (saves data)
//   - 3G: HLS with ABR, starts at low quality
//   - 4G/WiFi: HLS with ABR, starts at high quality
//   - Fallback: MP4 if HLS fails (e.g. very old browser)
function VideoPlayer({ videoUrl, posterUrl, alt }: { videoUrl: string; posterUrl: string; alt: string }) {
  const [playing, setPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [error, setError] = useState(false)
  const [dataSaverSkipped, setDataSaverSkipped] = useState(false)
  const vidRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<any>(null)
  const safeVideoUrl = getSafeVideoUrl(videoUrl)
  const hlsVideoUrl = getHlsVideoUrl(videoUrl)
  const quality = getConnectionQuality()
  const saveData = isDataSaverMode()

  // Determine if we should skip video due to slow connection or data saver
  const shouldSkipVideo = quality === 'slow' || saveData

  // Initialize hls.js when user clicks play
  const initHls = async () => {
    if (hlsRef.current) return

    try {
      const Hls = (await import('hls.js')).default

      if (!Hls.isSupported()) {
        // HLS not supported — fall back to native MP4
        const vid = vidRef.current
        if (!vid) return
        vid.src = safeVideoUrl
        try { await vid.play(); setPlaying(true) } catch { setError(true) }
        return
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        // Start at lowest quality for slow connections, highest for fast
        startLevel: quality === 'fast' ? -1 : 0, // -1 = auto, 0 = lowest
        // ABR settings — more aggressive for slow connections
        abrEwmaDefaultEstimate: quality === 'medium' ? 500000 : 2000000, // 500kbps / 2mbps
        abrBandWidthFactor: quality === 'medium' ? 0.8 : 0.9,
        abrBandWidthUpFactor: quality === 'medium' ? 0.7 : 0.8,
      })

      hls.loadSource(hlsVideoUrl)
      hls.attachMedia(vidRef.current!)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        hlsRef.current = hls
        const vid = vidRef.current
        if (vid) {
          vid.play().then(() => setPlaying(true)).catch(() => setError(true))
        }
      })

      hls.on(Hls.Events.ERROR, (event: any, data: any) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          // HLS failed — fall back to MP4
          hls.destroy()
          hlsRef.current = null
          const vid = vidRef.current
          if (vid) {
            vid.src = safeVideoUrl
            vid.play().then(() => setPlaying(true)).catch(() => setError(true))
          }
        }
      })

    } catch {
      // hls.js failed to load — fall back to native MP4
      const vid = vidRef.current
      if (!vid) return
      vid.src = safeVideoUrl
      try { await vid.play(); setPlaying(true) } catch { setError(true) }
    }
  }

  const handlePlay = () => {
    setHasInteracted(true)
    setError(false)

    // Connection-aware: allow play even if data saver is on,
    // but show a warning that data will be consumed
    setDataSaverSkipped(false)
    initHls()
  }

  const handlePause = () => {
    const vid = vidRef.current
    if (vid) vid.pause()
    setPlaying(false)
  }

  // Clean up hls.js on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  // On slow connection or data saver, show poster only with appropriate message
  if (shouldSkipVideo && !hasInteracted) {
    return (
      <div className="relative w-full h-full">
        <Image src={posterUrl} alt={alt} fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30">
          <button
            onClick={handlePlay}
            className="mb-3 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition"
          >
            <Play className="w-7 h-7 text-foreground ml-0.5" fill="currentColor" />
          </button>
          <p className="text-white text-xs text-center px-4 max-w-[200px]">
            {saveData
              ? "Data Saver mode — tap to play (may use ~50MB)"
              : "Slow connection detected — tap for lower quality video"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Thumbnail overlay before interaction */}
      {!hasInteracted && !error && (
        <Image src={posterUrl} alt={alt} fill sizes="50vw" className="object-cover" priority />
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center">
          <p className="text-white text-sm">Video unavailable</p>
        </div>
      )}
      
      {/* Play button */}
      {!hasInteracted && !error && !shouldSkipVideo && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 hover:bg-black/20 transition"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-7 h-7 text-foreground ml-0.5" fill="currentColor" />
          </div>
        </button>
      )}
      
      {/* Video element — hls.js attaches to this */}
      <video
        ref={vidRef}
        className={`w-full h-full object-cover ${hasInteracted && !error && !shouldSkipVideo ? 'opacity-100' : 'opacity-0'}`}
        preload="metadata"
        playsInline
        loop={false}
        muted={false}
        controls={hasInteracted && !error}
        crossOrigin="anonymous"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { console.error('Video error for:', safeVideoUrl); setError(true); setPlaying(false) }}
      />
    </div>
  )
}

interface ProductPageClientProps {
  productId: string
  initialProduct: Product
  initialSuggestions: Product[]
}

export function ProductPageClient({ productId, initialProduct, initialSuggestions }: ProductPageClientProps) {
  const router = useRouter()
  const { addItem, setIsOpen } = useCart()
  
  const [product, setProduct] = useState<Product>(initialProduct)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>(initialSuggestions)
  
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [preloaded, setPreloaded] = useState(false)

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

  // Initialize selected size from initial product data
  useEffect(() => {
    if (initialProduct.sizes) {
      const sizesArray = initialProduct.sizes.split(',').map((s: string) => s.trim())
      if (sizesArray.length > 0 && !selectedSize) {
        setSelectedSize(sizesArray[0])
      }
    }
  }, [initialProduct, selectedSize])

  // Real-time subscription for product changes
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

  useEffect(() => {
    if (!product || preloaded) return
    const imgs = product.images.filter((img) => img && img.trim() !== "")
    if (imgs.length === 0) return
    let loaded = 0
    const total = imgs.length
    imgs.forEach((url) => {
      const img = new window.Image()
      img.src = getOptimizedProductImage(url, "detail")
      img.onload = () => { loaded++; if (loaded === total) setPreloaded(true) }
      img.onerror = () => { loaded++; if (loaded === total) setPreloaded(true) }
    })
  }, [product, preloaded])

  useEffect(() => {
    if (!product || realImages.length === 0) return
    const currentIndex = selectedImageIndex
    const indicesToPreload = [
      currentIndex,
      (currentIndex + 1) % realImages.length,
      (currentIndex - 1 + realImages.length) % realImages.length,
    ]
    indicesToPreload.forEach((index) => {
      const imgUrl = realImages[index]
      if (!imgUrl || !isVideoUrl(imgUrl)) return
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = getSafeVideoUrl(imgUrl)
      video.load()
    })
  }, [product, selectedImageIndex, realImages])

  const thumbnailSlots = (() => {
    const slots = [...realImages]
    while (slots.length < 5) slots.push("")
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
    setSelectedImageIndex((prev) => prev === 0 ? realImages.length - 1 : prev - 1)
  }

  const goToNextImage = () => {
    if (realImages.length === 0) return
    setSelectedImageIndex((prev) => prev === realImages.length - 1 ? 0 : prev + 1)
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
    if (delta > swipeThreshold) goToNextImage()
    else if (delta < -swipeThreshold) goToPrevImage()
    touchStartX.current = null
    touchEndX.current = null
  }

  const defaultDeliveryText =
    "Nationwide delivery in 5–7 business days. Lagos and Port Harcourt orders typically arrive in 2–3 business days. Returns are accepted within 7 days of delivery for unused items in original packaging — contact us to start a return."

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "delivery", title: "Delivery & Returns", content: defaultDeliveryText }
  ]

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} is a premium quality hair product from Ammie N.`,
    "image": realImages.map(img => getOptimizedProductImage(img, "detail")),
    "sku": product.id,
    "brand": { "@type": "Brand", "name": "Ammie N" },
    "offers": {
      "@type": "Offer",
      "url": `https://ammiestore.com/product/${product.id}`,
      "priceCurrency": "NGN",
      "price": product.price.toString(),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "NGN" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "DAY" }
        },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "NG" }
      }
    },
    "aggregateRating": product.review_count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.review_count.toString()
    } : undefined
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8">
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-stretch">
                <div
                  className="relative flex-1 rounded-3xl overflow-hidden bg-card boty-shadow group touch-pan-y"
                  style={{ minHeight: '400px' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {isVideoUrl(realImages[selectedImageIndex] || "") ? (
                    <VideoPlayer
                      videoUrl={realImages[selectedImageIndex]}
                      posterUrl={getOptimizedProductImage(realImages[selectedImageIndex], "detail")}
                      alt={`${product.name} - Video ${selectedImageIndex + 1}`}
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
                            <ThumbnailVideo videoUrl={img} posterUrl={getOptimizedProductImage(img, "thumbnail")} />
                          ) : (
                            <Image src={getOptimizedProductImage(img, "thumbnail")} alt={`${product.name} thumbnail ${index + 1}`} fill sizes="76px" className="object-cover" />
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
                        <div key={index} className="w-16 h-16 md:w-[76px] md:h-[76px] rounded-xl bg-card" />
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
                      className={`w-2 h-2 rounded-full boty-transition ${selectedImageIndex === index ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">Ammie Hair</span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < product.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`} />
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
                        className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${selectedSize === size ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-card/80"}`}
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
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition" aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition" aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow cursor-pointer ${isAdded ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {isAdded ? (<><Check className="w-4 h-4" /> Added to Cart</>) : "Add to Cart"}
                </button>
                <button type="button" onClick={handleBuyNow} className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-primary text-primary px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary hover:text-primary-foreground cursor-pointer">
                  Buy Now
                </button>
              </div>
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button type="button" onClick={() => toggleAccordion(item.key)} className="w-full flex items-center justify-between py-5 text-left">
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground boty-transition ${openAccordion === item.key ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden boty-transition ${openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"}`}>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
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
                        <Image src={getOptimizedProductImage(suggestion.images[0] || "/placeholder.svg", "card")} alt={suggestion.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover boty-transition group-hover:scale-105" />
                      </div>
                      <div className="p-3 md:p-5 pb-4">
                        <h3 className="font-serif text-sm md:text-lg text-foreground mb-0.5 md:mb-1">{suggestion.name}</h3>
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <span className="text-xs md:text-base font-medium text-foreground">₦{suggestion.price.toLocaleString()}</span>
                        </div>
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[10px] md:text-xs tracking-wide boty-transition hover:bg-primary/90 boty-shadow">
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
    </>
  )
}