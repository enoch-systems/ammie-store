"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/layout/header"
import { ConfirmationModal } from "@/components/shared/confirmation-modal"
import { type Product } from "@/lib/supabase"
import { createClientBrowser } from "@/lib/supabase"
import type { ProductForm } from "@/features/admin/components/types"
import { emptyForm } from "@/features/admin/components/types"
import ImageGallery from "@/features/admin/components/image-gallery"
import BasicInfoForm from "@/features/admin/components/basic-info-form"
import PricingForm from "@/features/admin/components/pricing-form"
import RatingForm from "@/features/admin/components/rating-form"
import ProductGrid from "@/features/admin/components/product-grid"
import { getProductDescription } from "@/lib/services/product-descriptions"

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<ProductForm>({ ...emptyForm })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [sizes, setSizes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)
  const descriptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchProducts()
  }, [])

  // Set a distinct document title for the admin page
  useEffect(() => {
    document.title = "Admin Dashboard — Ammie N"
    return () => {
      document.title = "Ammie N — Premium Hair & Extensions"
    }
  }, [])

  // ── Real-time subscription ──────────────────────────────────────────
  // Whenever a row is inserted, updated, or deleted in the products table
  // we update local state immediately — no manual refresh needed.
  useEffect(() => {
    const client = createClientBrowser()

    // Fetch the full list when a change is detected rather than trying to
    // surgically insert/update/remove rows, because a payload may reference
    // a brand-new product we don't have cached yet (INSERT) or may contain
    // only the changed columns (UPDATE).
    const channel = client
      .channel("admin-products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts()
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [])

  // Fetch all products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const client = createClientBrowser()
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateField = (field: string, value: string) => {
    // Auto-capitalize the first letter of the product name
    let processedValue = value
    if (field === "name") {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1)
    }

    setForm((prev) => ({ ...prev, [field]: processedValue }))

    // Debounce auto-description generation: wait 4 seconds after the user
    // stops typing the product name before generating the description.
    if (field === "name") {
      if (descriptionTimerRef.current) {
        clearTimeout(descriptionTimerRef.current)
      }
      descriptionTimerRef.current = setTimeout(() => {
        setForm((prev) => {
          if (!prev.name.trim()) return prev
          return { ...prev, description: getProductDescription(prev.name) }
        })
      }, 4000)
    }
  }

  const handleRegenerateDescription = () => {
    setForm((prev) => ({
      ...prev,
      description: getProductDescription(prev.name)
    }))
  }

  const handleSizesChange = (newSizes: string[]) => {
    setSizes(newSizes)
    setForm((prev) => ({ ...prev, sizes: newSizes.join(',') } as ProductForm))
  }

  // Reads from `prev` (the latest state at the time this updater actually
  // runs) instead of the `form` variable captured in this function's
  // closure. This matters because ImageGallery can call onUpdateImage
  // multiple times back-to-back in the same event (e.g. filling a
  // thumbnail AND the main image). If we build newImages from the outer
  // `form.images` closure, both calls see the same stale array and the
  // second setForm call overwrites the first one's change. Using the
  // functional updater with `prev` ensures each call builds on the
  // actual latest array.
  const updateImage = (index: number, value: string) => {
    setForm((prev) => {
      const newImages = [...prev.images]
      newImages[index] = value
      return { ...prev, images: newImages }
    })
  }

  const generateId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Initialize productData early so it's available in catch block for logging
    let productData: Record<string, any> = {}

    try {
      // Sort images before saving: video always first, images fill the rest.
      // Rule enforcement:
      //   - If product has a video, it must be the main media (slot 0)
      //   - Slot 0 is the video poster thumbnail with play icon
      //   - Slots 1-4 are images only
      //   - Max 1 video + 4 images
      //   - If no video, all 5 slots can be images
      const rawImages = form.images.filter(img => img.trim() !== "")
      console.log('Step 1: Raw images count:', rawImages.length)
      
      const { isVideoUrl, getVideoPosterUrl } = await import('@/lib/cloudinary')
      console.log('Step 2: Cloudinary imported')
      
      // Separate video from images
      const video = rawImages.find(img => isVideoUrl(img))
      const images = rawImages.filter(img => !isVideoUrl(img))
      console.log('Step 3: Video found:', !!video, 'Images count:', images.length)
      
      // Build final sorted array: video (optional) + up to 4 images
      const sortedImages: string[] = []
      if (video) {
        sortedImages.push(video) // slot 0: video
      }
      // Fill slots 1-4 with images (up to 4)
      sortedImages.push(...images.slice(0, 4))
      console.log('Step 4: Sorted images count:', sortedImages.length)

      // Main media is required — block submission if empty
      if (sortedImages.length === 0) {
        toast.error('Please add at least one image or video before submitting.')
        return
      }

      // Build productData for saving and logging
      productData = {
        name: form.name,
        price: parseFloat(form.price),
        images: sortedImages,
        category: form.category,
        sizes: form.sizes,
        rating: parseFloat(form.rating),
        review_count: parseInt(form.reviewCount),
        badge: form.badge || null,
        description: form.description || getProductDescription(form.name),
      }
      console.log('Step 5: Product data built')

      const client = createClientBrowser()
      console.log('Step 6: Client created')

      if (editingId) {
        console.log('Step 7a: Updating product', editingId)
        // Update existing product
        const { error } = await client
          .from('products')
          .update(productData)
          .eq('id', editingId)

        if (error) {
          console.log('Step 8a: Update error:', error)
          throw error
        }
        console.log('Step 9a: Update successful')
        toast.success(`Product "${form.name}" updated successfully!`)

        // Trigger ISR revalidation so the product page refreshes instantly
        revalidateProductPage(editingId)
      } else {
        console.log('Step 7b: Inserting new product')
        // Add new product
        const { error } = await client
          .from('products')
          .insert([productData])

        if (error) {
          console.log('Step 8b: Insert error:', error)
          throw error
        }
        console.log('Step 9b: Insert successful')
        toast.success(`Product "${form.name}" added successfully!`)
      }

      console.log('Step 10: Resetting form')
      resetForm()
    } catch (error) {
      // Log the raw error FIRST before any processing
      console.error('=== RAW ERROR (no processing) ===')
      console.error('error:', error)
      console.error('typeof error:', typeof error)
      console.error('error === null:', error === null)
      console.error('error === undefined:', error === undefined)
      console.error('JSON.stringify(error):', JSON.stringify(error))
      console.error('=== END RAW ERROR ===')
      
      // Now process the error
      const errorAny = error as any
      const message = errorAny?.message || errorAny?.error_description || 'Unknown error'
      const details = errorAny?.details ? ` — ${errorAny.details}` : ''
      const hint = errorAny?.hint ? ` (hint: ${errorAny.hint})` : ''
      
      // Comprehensive error logging - log each field separately to avoid
      // bundler/overlay issues with object serialization
      console.error('=== Error saving product ===')
      console.error('Message:', message)
      console.error('Details:', errorAny?.details)
      console.error('Hint:', errorAny?.hint)
      console.error('Code:', errorAny?.code)
      console.error('Error type:', errorAny?.constructor?.name)
      console.error('Error keys:', errorAny ? Object.keys(errorAny) : [])
      console.error('Is Error instance:', error instanceof Error)
      console.error('String representation:', String(error))
      console.error('Stack:', errorAny?.stack)
      console.error('Product data:', JSON.stringify(productData, null, 2))
      console.error('Full error object:', errorAny)
      console.error('=== End error ===')
      
      toast.error(`Failed to save product: ${message}${details}${hint}`)
    }
  }

  const resetForm = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setSelectedImageIndex(0)
    setShowAddForm(false)
    // Previously missing: without this, a leftover `sizes` array from the
    // edit session you just finished could bleed into whatever you open
    // next, before fresh data has a chance to overwrite it.
    setSizes([])
  }

  const openAddForm = () => {
    setForm({ ...emptyForm })
    setEditingId(null)
    setSelectedImageIndex(0)
    setSizes([])
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const editProduct = (product: Product) => {
    const productSizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : []
    setForm({
      id: product.id,
      name: product.name,
      badge: product.badge || "",
      price: String(product.price),
      // 5 total image slots: index 0 is the main image (and doubles as the
      // first thumbnail), indices 1-4 are the remaining 4 thumbnails.
      images: [...product.images, "", "", "", "", ""].slice(0, 5),
      sizes: product.sizes,
      rating: String(product.rating),
      reviewCount: String(product.review_count),
      description: product.description || "",
      category: product.category
    })
    setSizes(productSizes)
    setEditingId(product.id)
    setSelectedImageIndex(0)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogout = async () => {
    const client = createClientBrowser()
    await client.auth.signOut()
    window.location.href = "/admin/login"
  }

  /**
   * Trigger on-demand ISR revalidation for a product page.
   * After updating a product (e.g. uploading a new video), this ensures
   * the statically-generated product page is refreshed immediately
   * without requiring a full rebuild.
   */
  const revalidateProductPage = async (productId: string) => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `/product/${productId}` }),
      })
    } catch (error) {
      console.error('Revalidation request failed:', error)
      // Non-critical — the page will still revalidate on its 60s ISR interval
    }
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      const client = createClientBrowser()
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      toast.success(`Product "${productToDelete.name}" deleted permanently!`)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id)
    if (product) {
      setProductToDelete({ id: product.id, name: product.name })
      setShowDeleteModal(true)
    }
  }

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products

  if (!mounted) return null

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header variant="admin" onLogoutClick={handleLogout} />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setProductToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="danger"
      />
      
      <div className="pt-35 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage all products</p>
            </div>
            <button
              type="button"
              onClick={openAddForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 sm:px-6 py-3 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Search Input - Centered and Responsive */}
          <div className="mb-8 sm:mb-10">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-background border border-border rounded-full pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Add/Edit Form Overlay */}
          {showAddForm && (
            <div className="mb-12 sm:mb-16 bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 boty-shadow border border-border/50">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground hover:text-foreground boty-transition cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20">
                {/* Left - Image Gallery */}
                <ImageGallery
                  images={form.images}
                  selectedImageIndex={selectedImageIndex}
                  onSelectImage={setSelectedImageIndex}
                  onUpdateImage={updateImage}
                />

                {/* Right - Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-6">
                  <BasicInfoForm
                    name={form.name}
                    badge={form.badge}
                    description={form.description}
                    category={form.category}
                    onChange={updateField}
                    onRegenerateDescription={handleRegenerateDescription}
                  />

                  <PricingForm
                    price={form.price}
                    sizes={sizes}
                    onSizesChange={handleSizesChange}
                    onChange={updateField}
                  />

                  <RatingForm
                    rating={form.rating}
                    reviewCount={form.reviewCount}
                    onChange={updateField}
                  />

                  {/* Submit / Cancel Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 pt-6">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow cursor-pointer"
                    >
                      {editingId ? "Update Product" : "Add Product"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Grid - Same layout as shop page */}
          <section>
            <div className="mb-6 sm:mb-8">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground">
                {loading ? "Loading..." : `All Products (${filteredProducts.length})`}
              </h2>
            </div>
            {loading && products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onEdit={editProduct}
                onDelete={deleteProduct}
              />
            )}
          </section>
        </div>
      </div>

    </main>
  )
}
