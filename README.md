# Ammie Store — Premium Wig & Hair Extensions E-Commerce

**Client:** Ammie Hair (Wig Vendor)  
**Project Type:** E-Commerce Web Application  
**Stack:** Next.js 15, TypeScript, Tailwind CSS, Cloudinary CDN  
**Status:** Live in Development

---

## Overview

Ammie Store is a modern, high-end e-commerce platform built for **Ammie Hair**, a premium wig and hair extensions vendor. The storefront is designed to reflect the luxury and quality of the brand, offering a seamless shopping experience for customers looking for HD lace wigs, full lace wigs, glueless wigs, hair extensions, and lace accessories.

This is a **client project** — a fully custom e-commerce solution replacing generic storefronts with a brand-first, conversion-optimized experience tailored to the African hair market.

---

## Problem Being Solved

The wig and hair extension industry in Africa is rapidly growing, but most vendors rely on:

- **Generic social media pages** (Instagram, WhatsApp) with no proper product catalog
- **Offline/phone ordering** with no cart or checkout flow
- **Low-quality product imagery** that doesn't convey the premium nature of the products
- **Poor mobile experiences** — most customers shop on their phones, yet many solutions are desktop-first

**Ammie Store solves these problems by providing:**

1. **A professional product catalog** — Wigs, extensions, and lace accessories organized by category with filtering
2. **High-fidelity product pages** — Detailed descriptions, size selectors, accordion info panels, and customer reviews
3. **Shopping cart system** — Add items, manage quantities, and proceed to checkout
4. **Cloudinary CDN imagery** — Fast-loading, optimized product images that showcase the quality of the hair
5. **Mobile-first responsive design** — Every component is built mobile-first, ensuring a smooth experience on the small screens where most customers browse and buy
6. **Search functionality** — Customers can quickly find products by name, description, or category
7. **Brand storytelling** — Hero section with video background, testimonial carousel, and premium UI that builds trust and conveys luxury

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Hero Section** | Full-screen video background with animated text overlay, centered on all screen sizes |
| **Product Grid** | Filterable grid with category tabs (Wig, Lace, Extension), animated transitions, and quick-add-to-cart |
| **Product Detail Page** | Size selector, quantity picker, accordion info (Details, How to Use, Materials, Delivery & Returns) |
| **Shopping Cart** | Slide-out drawer with item count badge, add/remove functionality |
| **Search Overlay** | Full-screen search with real-time filtering and product suggestions |
| **Testimonials** | Auto-scrolling testimonial carousel with star ratings |
| **Responsive Header** | Fixed navigation with mobile hamburger menu, search, account, and cart icons |
| **Cloudinary Integration** | All wig product images served via Cloudinary CDN for fast global delivery |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with custom theme (sand, cream, olive green palette)
- **Animations:** Custom CSS keyframes (blur-in, scale-fade-in)
- **Icons:** Lucide React
- **Image CDN:** Cloudinary
- **State Management:** React Context (cart, search blur)
- **Deployment:** Vercel (via v0)

---

## Project Structure

```
ammie-store/
├── app/
│   ├── globals.css          # Global styles, theme variables, animations
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   ├── shop/page.tsx        # Shop listing page
│   └── product/[id]/page.tsx # Product detail page
├── components/
│   ├── boty/
│   │   ├── hero.tsx         # Hero section with video background
│   │   ├── header.tsx       # Fixed navigation header
│   │   ├── product-grid.tsx # Filterable product grid
│   │   ├── testimonials.tsx # Testimonial carousel
│   │   ├── cart-context.tsx # Cart state management
│   │   ├── cart-drawer.tsx  # Slide-out cart drawer
│   │   ├── search-overlay.tsx # Search modal
│   │   └── search-blur-context.tsx # Search blur state
│   └── ui/                  # Reusable UI primitives
├── public/images/           # Static assets
└── styles/                  # Additional styles
```

---

## Design Philosophy

The design uses a warm, natural color palette (sand, cream, olive green, soft taupe) that reflects the brand's natural hair focus. Typography combines **Playfair Display** (serif, for elegance) with **DM Sans** (sans-serif, for readability). The UI is intentionally minimal and spacious, letting the product imagery take center stage while maintaining a luxury feel throughout the shopping experience.