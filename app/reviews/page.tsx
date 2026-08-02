"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ReviewCard } from "@/components/sections/review-card"
import { reviews } from "@/components/sections/reviews-data"

export default function ReviewsPage() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const handleViewMore = (reviewId: string) => {
    window.location.href = `/reviews/${reviewId}`
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-16">
            <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
              All Reviews
            </span>
            <h1 className={`font-serif text-4xl leading-tight text-foreground text-balance md:text-7xl mb-4 ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
              Customer Reviews
            </h1>
            <p className={`text-muted-foreground max-w-2xl mx-auto text-lg ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
              See what our customers are saying about their Ammie Hair experience
            </p>
          </div>

          {/* Reviews Grid */}
          <div ref={sectionRef} className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.8s', animationFillMode: 'forwards' } : {}}>
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="transition-all duration-700 ease-out"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <ReviewCard review={review} onViewMore={handleViewMore} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blur-in {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blur-in {
          animation: blur-in 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>

      <Footer />
    </main>
  )
}