"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Play } from "lucide-react"
import { Review } from "./reviews-data"

interface ReviewCardProps {
  review: Review
  onViewMore?: (reviewId: string) => void
}

export function ReviewCard({ review, onViewMore }: ReviewCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const mediaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const purchasedImage = review.productImage && review.productImage !== "/placeholder.jpg"
    ? review.productImage
    : "https://res.cloudinary.com/deafv5ovi/image/upload/v1785659333/product_kbhg7v.png"

  const handleScroll = () => {
    if (mediaRef.current) {
      const scrollLeft = mediaRef.current.scrollLeft
      const width = mediaRef.current.offsetWidth
      const index = Math.round(scrollLeft / width)
      setCurrentMediaIndex(index)
    }
  }

  const handleNavigateToReview = () => {
    if (onViewMore) {
      onViewMore(review.id)
      return
    }

    router.push(`/reviews/${review.id}`)
  }

  return (
    <div
      className="bg-white rounded-none overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={handleNavigateToReview}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleNavigateToReview()
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* Media Carousel */}
      {review.media.length > 0 && (
        <div className="relative bg-muted/30 rounded-t-none">
          <div
            ref={mediaRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar"
          >
            {review.media.map((media, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-full snap-center"
                style={{ aspectRatio: '1/1' }}
              >
                {media.type === 'image' ? (
                  <Image
                    src={media.url}
                    alt={`Review media ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={media.thumbnail || media.url}
                      alt={`Video thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {review.media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {review.media.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setCurrentMediaIndex(index);
                    if (mediaRef.current) {
                      mediaRef.current.scrollTo({ left: index * mediaRef.current.offsetWidth, behavior: 'smooth' })
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentMediaIndex ? 'bg-white w-4' : 'bg-white/60'
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Content */}
      <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Customer Info */}
        <div className="flex items-start gap-2.5 mb-2.5">
          <Image
            src={review.customerAvatar}
            alt={review.customerName}
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground text-xs md:text-sm truncate">{review.customerName}</h3>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">{review.location}</p>
          </div>
        </div>

        {/* Comment */}
        <p className="text-xs md:text-sm text-foreground/80 leading-relaxed mb-2.5 line-clamp-3 flex-grow">
          {review.comment}
        </p>

        {/* Product Tag */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            handleNavigateToReview()
          }}
          className="flex items-center gap-2 mb-2.5 pb-2.5 border-b border-border/50 w-full text-left cursor-pointer"
        >
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={purchasedImage}
              alt={review.productName}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs text-muted-foreground">Purchased</p>
            <p className="text-xs md:text-sm font-medium text-foreground truncate">{review.productName}</p>
          </div>
        </button>

        {/* Actions */}
        <div className="flex items-center justify-end pt-2">
          {onViewMore && (
            <Link
              href={`/reviews/${review.id}`}
              onClick={(e) => {
                e.preventDefault()
                onViewMore(review.id)
              }}
              className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span>View More</span>
              <span aria-hidden="true">&gt;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}