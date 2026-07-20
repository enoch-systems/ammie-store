import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use the SSR-aware browser client so the auth session/cookies are
// properly shared with the rest of the @supabase/ssr setup.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Database types (simplified)
export interface Product {
  id: string
  name: string
  price: number
  images: string[]
  badge: string | null
  category: string
  sizes: string
  rating: number
  review_count: number
  description: string
  created_at: string
  updated_at: string
}

export interface ProductInsert {
  name: string
  price: number
  images: string[]
  badge?: string | null
  category: string
  sizes: string
  rating?: number
  review_count?: number
  description?: string
}
