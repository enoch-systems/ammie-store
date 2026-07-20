import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ChevronDown, Search } from "lucide-react"

const faqCategories = [
  {
    title: "Orders & Shipping",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Orders are processed within 1-2 business days. Standard shipping takes 3-7 business days depending on your location. Express shipping is available at checkout for faster delivery."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to select countries across Africa and internationally. Shipping rates and delivery times vary by location. You can see exact shipping costs at checkout before completing your order."
      },
      {
        q: "What is your shipping cost?",
        a: "We offer free standard shipping on all orders over ₦100,000. For orders under ₦100,000, a flat shipping fee applies. Express shipping options are available at an additional cost."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
   questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 14 days of delivery. Products must be unused, unwashed, and in their original packaging with all tags attached. Once we receive and inspect the return, we'll process your refund within 5-7 business days."
      },
      {
        q: "Can I exchange my wig for a different size?",
        a: "Yes, exchanges are welcome within 14 days of delivery. Please contact our customer service team to initiate an exchange. You'll be responsible for return shipping, and we'll ship the new size at no additional cost."
      },
      {
        q: "What if my product arrives damaged?",
        a: "If your order arrives damaged or defective, please contact us within 48 hours of delivery with photos of the damage. We'll arrange a replacement or full refund, including return shipping costs."
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5-7 business days after we receive and inspect your return. The refund will be issued to your original payment method. Depending on your bank, it may take an additional 2-5 business days to appear in your account."
      }
    ]
  },
  {
    title: "Product Care",
    questions: [
      {
        q: "How do I care for my wig?",
        a: "Wash your wig every 6-8 wears using sulfate-free shampoo and conditioner. Always use cool water and avoid rubbing or twisting the hair. Apply a leave-in conditioner and allow the wig to air dry on a wig stand. Store on a wig stand or in a silk bag when not in use."
      },
      {
        q: "Can I style my wig with heat tools?",
        a: "Yes, our wigs are made with 100% virgin human hair that can be heat styled up to 400°F (200°C). Always use a heat protectant spray before styling. For curly textures, we recommend limiting heat use to preserve the curl pattern."
      },
      {
        q: "How long will my wig last?",
        a: "With proper care, our wigs can last 6-12 months or longer. The lifespan depends on how often you wear it, how well you maintain it, and the products you use. Following our care guide will help maximize longevity."
      },
      {
        q: "Can I color or dye my wig?",
        a: "Yes, since our wigs are made with 100% virgin human hair, they can be dyed or colored. We recommend having a professional colorist handle the process to avoid damage. Always perform a strand test first."
      }
    ]
  },
  {
    title: "Sizing & Fit",
    questions: [
      {
        q: "How do I choose the right size?",
        a: "Measure your head circumference just above your ears and around the nape of your neck. Our wigs come in standard sizes with adjustable straps. If you're between sizes or have a larger head circumference, please contact us for custom sizing options."
      },
      {
        q: "Are the wigs adjustable?",
        a: "Yes, all our wigs feature adjustable straps and combs inside the cap. This allows you to customize the fit for maximum comfort and security. Most wigs fit head circumferences of 21-23 inches."
      },
      {
        q: "What if the wig doesn't fit?",
        a: "If your wig doesn't fit properly, you can exchange it within 14 days for a different size. We also offer custom sizing for an additional fee. Contact our team and we'll help you find the perfect fit."
      }
    ]
  },
  {
    title: "Hair Quality",
    questions: [
      {
        q: "What type of hair do you use?",
        a: "We use 100% virgin human hair sourced from donors. Our hair is never chemically processed, maintains its natural cuticle alignment, and can be styled, colored, and treated just like your natural hair."
      },
      {
        q: "Is your hair ethically sourced?",
        a: "Yes, we are committed to ethical sourcing practices. Our hair is collected through fair trade partnerships with donors who are compensated fairly. We believe in transparency and respect throughout our supply chain."
      },
      {
        q: "What is the difference between your lace types?",
        a: "HD (High Definition) lace is ultra-thin and transparent, making it virtually invisible on any skin tone. Swiss lace is slightly thicker but still very natural-looking. Both are high quality — HD lace offers the most undetectable finish."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Got Questions?
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Everything you need to know about our products, shipping, returns, and more
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-16">
            {faqCategories.map((category) => (
              <section key={category.title}>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-8 pb-4 border-b border-border/50">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((item, index) => (
                    <details
                      key={index}
                      className="group bg-card rounded-2xl boty-shadow overflow-hidden boty-transition open:bg-card"
                    >
                      <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer list-none text-foreground font-medium hover:text-primary boty-transition">
                        <span className="text-sm md:text-base">{item.q}</span>
                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 boty-transition group-open:rotate-180" />
                      </summary>
                      <div className="px-5 md:px-6 pb-5 md:pb-6">
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-20 text-center bg-card rounded-3xl p-10 md:p-14 boty-shadow">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Can't find the answer you're looking for? Please reach out to our friendly team.
            </p>
            <a
              href="mailto:support@ammiehair.com"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}