-- إنشاء enum للفئات
CREATE TYPE product_category AS ENUM (
  'grilled_meat',
  'grilled_chicken',
  'sandwiches',
  'single_meals',
  'family_meals',
  'extras'
);

-- جدول المنتجات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category product_category NOT NULL,
  description TEXT,
  image_url TEXT,
  weights JSONB NOT NULL, -- {quarter: 100, half: 200, three_quarter: 300, full: 400}
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول العروض
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL, -- قائمة المنتجات في العرض
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الإعلانات
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الطلبات
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER GENERATED ALWAYS AS IDENTITY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  delivery_notes TEXT,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الإعدادات (للباسورد ومعلومات الواتساب)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Anyone can read advertisements" ON advertisements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);

-- سياسات الكتابة (تحتاج مصادقة)
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage offers" ON offers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage advertisements" ON advertisements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can read orders" ON orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage settings" ON settings FOR ALL USING (auth.uid() IS NOT NULL);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج كلمة السر المشفرة
INSERT INTO settings (key, value) VALUES 
  ('admin_password', crypt('01278006248m', gen_salt('bf'))),
  ('ads_password', crypt('0127800624801204486263', gen_salt('bf'))),
  ('whatsapp_number', '201226654541');

-- إضافة bucket للصور
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- سياسات Storage
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);