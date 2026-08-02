import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { TrustBadges } from "@/components/sections/trust-badges"
import { FeatureSection } from "@/components/sections/feature-section"
import { ProductGrid } from "@/components/product/product-grid"
import { ReviewsSection } from "@/components/sections/reviews-section"
import { Newsletter } from "@/components/sections/newsletter"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <ProductGrid />
      <FeatureSection />
      <ReviewsSection />
      <Newsletter />
      <Footer />
    </main>
  )
}
