"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const videoSources = [
  "https://res.cloudinary.com/deafv5ovi/video/upload/v1784349848/herovide_gmwx0z.mp4",
  "https://res.cloudinary.com/deafv5ovi/video/upload/v1784539931/11111_2_p8px5y.mp4",
  "https://res.cloudinary.com/deafv5ovi/video/upload/v1784540017/11111_10_cngcxo.mp4",
  "https://res.cloudinary.com/deafv5ovi/video/upload/v1784539973/11111_5_cnb1gk.mp4",
  "https://res.cloudinary.com/deafv5ovi/video/upload/v1784539990/11111_1_e3pcgl.mp4",
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#e3e1e2' }}>
      {/* Background Video Grid */}
      <div className="absolute inset-0 border-b border-border/50 overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#e3e1e2' }}>
        {/* Mobile: 1 video */}
        <div className="grid grid-cols-1 vsm:grid-cols-2 vmd:grid-cols-3 vlg:grid-cols-4 vxl:grid-cols-5 gap-0 w-full h-full mx-auto px-4 sm:px-6 lg:px-2 xl:px-4 py-8 md:py-12 lg:py-16">
          {videoSources.map((src, i) => (
            <div key={i} className={`relative w-full h-full min-h-[50vh] md:min-h-[60vh] lg:min-h-[70vh] overflow-hidden rounded-2xl ${i === 1 ? 'hidden vsm:block' : ''} ${i === 2 ? 'hidden vmd:block' : ''} ${i === 3 ? 'hidden vlg:block' : ''} ${i === 4 ? 'hidden vxl:block' : ''}`}>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={src} type="video/mp4" />
              </video>
            </div>
          ))}
          {/* Subtle blend between videos */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent vsm:from-background/5 vsm:via-background/5 vsm:to-background/5 vmd:from-background/5 vmd:via-background/5 vmd:to-background/5 vlg:from-background/5 vlg:via-background/5 vlg:to-background/5 vxl:from-background/5 vxl:via-background/5 vxl:to-background/5" style={{ zIndex: 1 }} />
        </div>
        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg lg:max-w-xl mx-auto text-center lg:text-left">
            <span className="text-sm uppercase mb-6 block text-[#C4A882] lg:text-black animate-blur-in opacity-0 tracking-normal" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Premium Hair & Extensions
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 text-[#C4A882] lg:text-black">
              <span className="block animate-blur-in opacity-0 font-semibold" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>Wear confidence.</span>
              <span className="block animate-blur-in opacity-0 font-semibold xl:text-9xl text-3xl sm:text-6xl md:text-7xl lg:text-8xl break-words" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>Naturally you.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-10 max-w-sm sm:max-w-md mx-auto text-[#D4B896] lg:text-black animate-blur-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              Premium wigs and hair extensions crafted for beauty, comfort, and effortless style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-blur-in opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-black/90 boty-shadow lg:bg-black lg:text-white"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#C4A882]">
        <span className="text-xs tracking-widest uppercase font-bold">Scroll</span>
        <div className="w-px h-12 bg-foreground/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-foreground/60 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
