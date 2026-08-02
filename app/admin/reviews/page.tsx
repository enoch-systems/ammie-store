"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, X } from "lucide-react"
import { Country } from "country-state-city"
import { toast } from "sonner"
import { Header } from "@/components/layout/header"
import { ReviewCard } from "@/components/sections/review-card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { reviews as initialReviews, type Review } from "@/components/sections/reviews-data"

export default function AdminReviewsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [reviewList, setReviewList] = useState<Review[]>(() => initialReviews)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewEditingId, setReviewEditingId] = useState<string | null>(null)
  const [reviewPreviewMedia, setReviewPreviewMedia] = useState<Review["media"]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const reviewsPerPage = 12
  const MAX_REVIEW_IMAGES = 4
  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    country: "",
    city: "",
    rating: "5",
    comment: "",
    productName: "",
    productImage: "/placeholder.jpg",
    customerAvatar: "/placeholder-user.jpg",
    likes: 0,
    date: new Date().toISOString().split("T")[0],
  })

  const allCountries = useMemo(() =>
    Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const filteredCountries = useMemo(() => {
    const search = countrySearch.trim().toLowerCase()

    if (!search) {
      return allCountries
    }

    return allCountries.filter((country) =>
      country.name.toLowerCase().includes(search) || country.isoCode.toLowerCase().includes(search)
    )
  }, [allCountries, countrySearch])

  useEffect(() => {
    setMounted(true)

    let mountedCheck = true
    let retries = 0
    const MAX_RETRIES = 5

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mountedCheck) return

      if (session) {
        setAuthChecking(false)
        return
      }

      retries++
      if (retries < MAX_RETRIES) {
        setTimeout(checkAuth, 500)
        return
      }

      router.replace("/admin/login")
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (!mountedCheck) return

      if (event === "SIGNED_IN" && session) {
        setAuthChecking(false)
      } else if (event === "SIGNED_OUT") {
        router.replace("/admin/login")
      }
    })

    return () => {
      mountedCheck = false
      subscription.unsubscribe()
    }
  }, [router])

  const resetReviewForm = () => {
    setReviewForm({
      customerName: "",
      country: "",
      city: "",
      rating: "5",
      comment: "",
      productName: "",
      productImage: "/placeholder.jpg",
      customerAvatar: "/placeholder-user.jpg",
      likes: 0,
      date: new Date().toISOString().split("T")[0],
    })
    setCountrySearch("")
    setShowCountryDropdown(false)
    setReviewEditingId(null)
    setReviewPreviewMedia([])
    setShowReviewModal(false)
  }

  const openAddReviewForm = () => {
    resetReviewForm()
    setShowReviewModal(true)
  }

  const editReview = (review: Review) => {
    const [city, country] = review.location.split(",").map((value) => value.trim())

    setReviewForm({
      customerName: review.customerName,
      country: country || "",
      city: city || review.location,
      rating: String(review.rating),
      comment: review.comment,
      productName: review.productName,
      productImage: review.productImage,
      customerAvatar: review.customerAvatar,
      likes: review.likes,
      date: review.date,
    })
    setCountrySearch(country || "")
    setReviewEditingId(review.id)
    setReviewPreviewMedia(review.media)
    setShowReviewModal(true)
  }

  const handleReviewFieldChange = (field: string, value: string) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }))

    if (field === "country") {
      setCountrySearch(value)
    }
  }

  const selectCountry = (countryName: string) => {
    setReviewForm((prev) => ({ ...prev, country: countryName }))
    setCountrySearch(countryName)
    setShowCountryDropdown(false)
  }

  const handleRemoveReviewMedia = (index: number) => {
    setReviewPreviewMedia((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const isReviewMediaValid = reviewPreviewMedia.length >= 1 && reviewPreviewMedia.length <= MAX_REVIEW_IMAGES

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isReviewMediaValid) {
      toast.error(`A review must have between 1 and ${MAX_REVIEW_IMAGES} images`)
      return
    }

    const location = [reviewForm.city.trim(), reviewForm.country.trim()].filter(Boolean).join(", ") || "Unknown location"

    const cleanReview: Review = {
      id: reviewEditingId || String(Date.now()),
      customerName: reviewForm.customerName.trim() || "Unnamed Customer",
      customerAvatar: reviewForm.customerAvatar || "/placeholder-user.jpg",
      location,
      rating: Number(reviewForm.rating) || 5,
      comment: reviewForm.comment.trim() || "No comment provided",
      productName: reviewForm.productName.trim() || "Unknown product",
      productImage: reviewForm.productImage || "/placeholder.jpg",
      media: reviewPreviewMedia,
      likes: Number(reviewForm.likes) || 0,
      date: reviewForm.date || new Date().toISOString().split("T")[0],
      comments: [],
    }

    setReviewList((prev) => {
      if (reviewEditingId) {
        return prev.map((review) => (review.id === reviewEditingId ? cleanReview : review))
      }

      return [cleanReview, ...prev]
    })

    toast.success(reviewEditingId ? "Review updated successfully" : "Review added successfully")
    resetReviewForm()
  }

  const totalPages = Math.ceil(reviewList.length / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = reviewList.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages: number[] = []

    let startPage = Math.max(1, currentPage - 1)
    let endPage = Math.min(totalPages, startPage + 2)

    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/admin/login"
  }

  if (!mounted || authChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header variant="admin" onLogoutClick={handleLogout} />

      <div className="pt-35 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-1 sm:mb-2">Review Manager</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Add and edit customer reviews</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-5 sm:px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <button
                type="button"
                onClick={openAddReviewForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 sm:px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
            </div>
          </div>

          <Dialog open={showReviewModal} onOpenChange={(open) => {
            if (!open) {
              resetReviewForm()
            }
          }}>
            <DialogContent className="w-[min(96vw,1600px)] max-w-none sm:max-w-[95vw] md:max-w-[1400px] lg:max-w-[1500px] p-0 overflow-hidden rounded-[32px] border border-border/50 bg-card shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-[460px_minmax(0,1fr)] max-h-[90vh] overflow-hidden">
                <div className="bg-muted/40 p-6 md:p-7 lg:p-8 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto lg:min-h-0">
                  <div className="mb-5">
                    <h3 className="font-serif text-xl text-foreground">Review Images</h3>
                    <p className="text-xs text-muted-foreground mt-1">Add between 1 and {MAX_REVIEW_IMAGES} images for this review</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5 mx-auto max-w-[320px] sm:max-w-none">
                    {Array.from({ length: MAX_REVIEW_IMAGES }).map((_, index) => {
                      const media = reviewPreviewMedia[index]

                      return (
                        <div key={`slot-${index}`} className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-border/50 bg-background">
                          {media ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRemoveReviewMedia(index)}
                                className="absolute top-1.5 right-1.5 z-10 rounded-full bg-background/90 p-1 text-foreground shadow-sm"
                                aria-label={`Remove media ${index + 1}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <img src={media.url} alt={`Review media ${index + 1}`} className="w-full h-full object-cover" />
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <Plus className="w-5 h-5 sm:w-8 sm:h-8" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {reviewPreviewMedia.length}/{MAX_REVIEW_IMAGES} images selected
                  </p>
                </div>

                <div className="p-6 md:p-8 lg:p-10 overflow-y-auto lg:min-h-0">
                  <DialogHeader className="mb-6 md:mb-8">
                    <DialogTitle className="font-serif text-2xl text-foreground">
                      {reviewEditingId ? "Edit Review" : "Add New Review"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Update this review without leaving the current page.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleReviewSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">Customer Name</span>
                      <input
                        type="text"
                        value={reviewForm.customerName}
                        onChange={(e) => handleReviewFieldChange("customerName", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">Country</span>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={countrySearch}
                          onFocus={() => setShowCountryDropdown(true)}
                          onChange={(e) => {
                            handleReviewFieldChange("country", e.target.value)
                            setShowCountryDropdown(true)
                          }}
                          placeholder="Search country"
                          className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {showCountryDropdown && (
                        <div className="max-h-52 overflow-y-auto rounded-xl border border-border bg-background shadow-sm">
                          {filteredCountries.length === 0 ? (
                            <p className="px-3 py-3 text-sm text-muted-foreground">No country found</p>
                          ) : (
                            filteredCountries.map((country) => (
                              <button
                                key={country.isoCode}
                                type="button"
                                onClick={() => selectCountry(country.name)}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
                              >
                                <span>{country.name}</span>
                                <span className="text-xs text-muted-foreground">{country.isoCode}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">City</span>
                      <input
                        type="text"
                        value={reviewForm.city}
                        onChange={(e) => handleReviewFieldChange("city", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">Product Name</span>
                      <input
                        type="text"
                        value={reviewForm.productName}
                        onChange={(e) => handleReviewFieldChange("productName", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-foreground">Rating</span>
                      <div className="relative">
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={reviewForm.rating}
                          onChange={(e) => handleReviewFieldChange("rating", e.target.value)}
                          className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                        </select>
                      </div>
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-medium text-foreground">Review Comment</span>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => handleReviewFieldChange("comment", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={!isReviewMediaValid}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewEditingId ? "Update Review" : "Save Review"}
                      </button>
                      <button
                        type="button"
                        onClick={resetReviewForm}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            {currentReviews.map((review) => (
              <div key={review.id} className="relative transition-all duration-300">
                <ReviewCard
                  review={review}
                  onViewMore={() => editReview(review)}
                  actionLabel="Edit review"
                />

                <button
                  type="button"
                  onClick={() => editReview(review)}
                  className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-foreground shadow-sm border border-border hover:bg-white cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "text-muted-foreground/20 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? "text-muted-foreground/20 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
