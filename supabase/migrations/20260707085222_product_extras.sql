-- Add features column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;

-- Product reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing sizes (34-38)
INSERT INTO sizes (label) VALUES ('34'), ('35'), ('36'), ('37'), ('38')
ON CONFLICT (label) DO NOTHING;

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Reviews are public" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert review" ON product_reviews FOR INSERT WITH CHECK (true);
