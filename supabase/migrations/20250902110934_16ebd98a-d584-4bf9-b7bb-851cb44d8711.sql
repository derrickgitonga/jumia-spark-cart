-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  reviews INTEGER DEFAULT 0,
  discount INTEGER,
  is_new BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  brand TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for cart items
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Create policies for orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for order items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, image_url, rating, reviews, discount, is_new, category, brand) VALUES
-- Smartphones
('iPhone 15 Pro Max 256GB', 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system with 5x telephoto zoom.', 1199.99, 1299.99, 'https://images.unsplash.com/photo-1592286900962-23b8d33da63e?w=400&h=400&fit=crop', 5, 234, 8, true, 'smartphones', 'Apple'),
('Samsung Galaxy S24 Ultra', 'Premium Android flagship with S Pen, 200MP camera, and AI-powered features.', 1299.99, null, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 5, 198, null, true, 'smartphones', 'Samsung'),
('Google Pixel 8 Pro', 'Google flagship with advanced AI photography and pure Android experience.', 999.99, 1099.99, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop', 4, 156, 9, false, 'smartphones', 'Google'),
('OnePlus 12', 'Flagship killer with Snapdragon 8 Gen 3 and ultra-fast charging.', 799.99, 899.99, 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400&h=400&fit=crop', 4, 89, 11, false, 'smartphones', 'OnePlus'),
('Xiaomi 14 Ultra', 'Photography-focused flagship with Leica partnership and premium design.', 1199.99, null, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop', 5, 67, null, true, 'smartphones', 'Xiaomi'),

-- Laptops
('MacBook Pro 14-inch M3 Pro', 'Professional laptop with M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life.', 1999.99, 2199.99, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', 5, 156, 9, false, 'laptops', 'Apple'),
('Dell XPS 13 Plus', 'Ultra-portable laptop with Intel i7, 16GB RAM, and premium build quality.', 1599.99, null, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop', 4, 78, null, false, 'laptops', 'Dell'),
('HP Spectre x360', 'Convertible laptop with 4K OLED display and premium materials.', 1399.99, 1599.99, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop', 4, 145, 13, false, 'laptops', 'HP'),

-- Headphones & Airpods
('Sony WH-1000XM5', 'Industry-leading wireless noise canceling headphones with 30-hour battery life.', 349.99, 399.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 4, 89, 13, false, 'headphones', 'Sony'),
('Apple AirPods Pro 2nd Gen', 'Advanced active noise cancellation with adaptive transparency and spatial audio.', 249.99, null, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop', 5, 312, null, true, 'headphones', 'Apple'),
('Bose QuietComfort 45', 'Premium wireless headphones with world-class noise cancellation.', 329.99, 379.99, 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=400&h=400&fit=crop', 4, 167, 13, false, 'headphones', 'Bose'),
('Apple AirPods Max', 'Over-ear headphones with high-fidelity audio and adaptive EQ.', 549.99, null, 'https://images.unsplash.com/photo-1608156639585-b3a08049f3d2?w=400&h=400&fit=crop', 4, 98, null, false, 'headphones', 'Apple'),

-- Smart Watches
('Apple Watch Series 9 GPS', 'Advanced smartwatch with fitness tracking, health monitoring, and cellular connectivity.', 499.99, null, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', 4, 145, null, false, 'smartwatches', 'Apple'),
('Samsung Galaxy Watch 6', 'Android smartwatch with comprehensive health tracking and long battery life.', 329.99, 379.99, 'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?w=400&h=400&fit=crop', 4, 89, 13, false, 'smartwatches', 'Samsung'),
('Garmin Forerunner 955', 'GPS running smartwatch with advanced training metrics and multi-sport tracking.', 449.99, 499.99, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop', 5, 234, 10, false, 'smartwatches', 'Garmin'),

-- Gaming & Cameras
('PlayStation 5 Console', 'Next-gen gaming console with ultra-high speed SSD and ray tracing support.', 599.99, 649.99, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop', 5, 312, 8, false, 'gaming', 'Sony'),
('Canon EOS R5 Camera', 'Professional mirrorless camera with 45MP sensor and 8K video recording.', 3899.99, 4199.99, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop', 5, 67, 7, false, 'cameras', 'Canon');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();