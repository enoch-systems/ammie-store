-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table (simplified)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  badge TEXT,
  category TEXT NOT NULL CHECK (category IN ('wigs', 'extensions', 'lace')),
  sizes TEXT,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING GIN(to_tsvector('english', name));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view products
CREATE POLICY "Public can view products" 
ON products FOR SELECT USING (true);

-- Only authenticated admins can insert
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update
CREATE POLICY "Admins can update products" 
ON products FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated admins can delete
CREATE POLICY "Admins can delete products" 
ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions (adjust based on your auth setup)
-- GRANT SELECT ON products TO anon;
-- GRANT ALL ON products TO authenticated;

-- =====================================================
-- REAL-TIME: Enable publication so changes broadcast
-- instantly to every connected browser without a manual
-- page refresh.  Run this in the Supabase SQL Editor
-- after the table exists.
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE products;