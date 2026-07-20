"use client"

import React from "react"
import { ArrowRight } from "lucide-react"

const YOUTUBE_URL = "https://www.youtube.com/@AmmieStore"

export function Newsletter() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/deafv5ovi/video/upload/v1784539923/11111_7_xm8ovg.mp4" type="video/mp4" />
        </video>
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Left edge blend - fades to page background */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48" style={{ background: "linear-gradient(to right, #F7F4EF, transparent)" }} />
        {/* Right edge blend */}
        <div className="absolute inset-y-0 right-0 w-24 md:w-48" style={{ background: "linear-gradient(to left, #F7F4EF, transparent)" }} />
        {/* Top edge blend */}
        <div className="absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, #F7F4EF, transparent)" }} />
        {/* Bottom edge blend */}
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, #F7F4EF, transparent)" }} />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-sans text-4xl leading-tight text-white mb-4 text-balance md:text-7xl">
            Subscribe to our YouTube
          </h2>
          <p className="font-sans text-lg text-white/80 mb-10">
            Watch tutorials, styling tips, and behind-the-scenes content from the Ammie family.
          </p>

          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-sm tracking-wide transition-all duration-300"
          >
            {/* YouTube Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe to YouTube
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  )
}