"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Temitope A.",
    location: "Lagos",
    rating: 5,
    text: "My HD wig looks absolutely natural. The lace melts perfectly into my skin. I've never felt more confident!",
    product: "HD Transparent Wig"
  },
  {
    id: 2,
    name: "Chioma N.",
    location: "Enugu",
    rating: 5,
    text: "Finally, hair extensions that actually match my texture. No more tangling or shedding. Ammie Hair is truly premium quality.",
    product: "Brazilian Body Wave"
  },
  {
    id: 3,
    name: "Adesuwa O.",
    location: "Oyo",
    rating: 5,
    text: "The Full Lace Wig is absolutely beautiful. I can part it anywhere and it genuinely looks like my own hair.",
    product: "Full Lace Wig"
  },
  {
    id: 4,
    name: "Chinwe E.",
    location: "Anambra",
    rating: 5,
    text: "I've tried so many lace frontals, but nothing compares to the transparency of Ammie Hair's HD lace. Worth every naira.",
    product: "Transparent Lace Frontal"
  },
  {
    id: 5,
    name: "Adebimpe S.",
    location: "Ogun",
    rating: 5,
    text: "The packaging is elegant and the hair quality exceeded my expectations. I'll definitely be ordering again.",
    product: "Glueless Wig"
  },
  {
    id: 6,
    name: "Amarachi U.",
    location: "Imo",
    rating: 5,
    text: "My clip-in extensions blend seamlessly with my natural hair. They added instant volume without looking artificial.",
    product: "Clip-In Extensions"
  },
  {
    id: 7,
    name: "Yetunde A.",
    location: "Osun",
    rating: 5,
    text: "The Peruvian Straight hair is silky, soft, and doesn't shed. It holds curls beautifully even after washing.",
    product: "Peruvian Straight"
  },
  {
    id: 8,
    name: "Ngozi I.",
    location: "Abia",
    rating: 5,
    text: "I love the attention to detail. The lace is practically invisible, and everyone keeps asking where I got my hair.",
    product: "Lace Front Wig"
  },
  {
    id: 9,
    name: "Tolulope M.",
    location: "Ekiti",
    rating: 5,
    text: "The Deep Wave Closure is gorgeous. The curls stay defined and the quality is exactly what I was hoping for.",
    product: "Deep Wave Closure"
  }
];
const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="rounded-3xl p-6 bg-white mb-4 flex-shrink-0"
    style={{
      boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"
    }}
  >
    {/* Stars */}
    

    {/* Quote */}
    <p className="text-foreground/80 leading-relaxed mb-4 text-pretty font-medium text-xl font-serif tracking-wide">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-foreground text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
        {testimonial.product}
      </span>
    </div>
  </div>
)

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  
  const column1 = [testimonials[0], testimonials[3], testimonials[6]]
  const column2 = [testimonials[1], testimonials[4], testimonials[7]]
  const column3 = [testimonials[2], testimonials[5], testimonials[8]]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background overflow-hidden pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Real Reviews
          </span>
          <h2 className={`font-serif text-4xl leading-tight text-foreground text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            What our customers say
          </h2>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          
          {/* Mobile - Single Column */}
          <div className="md:hidden h-[600px]">
            <div className="relative overflow-hidden h-full">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <TestimonialCard key={`mobile-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop - Three Columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Column 1 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column1, ...column1].map((testimonial, index) => (
                  <TestimonialCard key={`col1-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 2 - Scrolling Up */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-up hover:animate-scroll-up-slow">
                {[...column2, ...column2].map((testimonial, index) => (
                  <TestimonialCard key={`col2-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 3 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column3, ...column3].map((testimonial, index) => (
                  <TestimonialCard key={`col3-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }

        .animate-scroll-down-slow {
          animation: scroll-down 60s linear infinite;
        }

        .animate-scroll-up-slow {
          animation: scroll-up 60s linear infinite;
        }
      `}</style>
    </section>
  )
}