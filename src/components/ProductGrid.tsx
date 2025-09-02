import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews: number;
  discount?: number;
  is_new: boolean;
  category: string;
  brand?: string;
}

// Keeping mock data as fallback
const mockProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB - Natural Titanium",
    price: 1199.99,
    originalPrice: 1299.99,
    image: "https://images.unsplash.com/photo-1592286900962-23b8d33da63e?w=400&h=400&fit=crop",
    rating: 5,
    reviews: 234,
    discount: 8,
    isNew: true,
    category: "smartphones"
  },
  {
    id: "2",
    name: "MacBook Pro 14-inch M3 Pro Chip - Space Black",
    price: 1999.99,
    originalPrice: 2199.99,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    rating: 5,
    reviews: 156,
    discount: 9,
    category: "laptops"
  },
  {
    id: "3",
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    price: 349.99,
    originalPrice: 399.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4,
    reviews: 89,
    discount: 13,
    category: "headphones"
  },
  {
    id: "4",
    name: "Samsung Galaxy S24 Ultra 512GB - Titanium Gray",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    rating: 5,
    reviews: 198,
    isNew: true,
    category: "smartphones"
  },
  {
    id: "5",
    name: "Canon EOS R5 Mirrorless Camera Body",
    price: 3899.99,
    originalPrice: 4199.99,
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop",
    rating: 5,
    reviews: 67,
    discount: 7,
    category: "cameras"
  },
  {
    id: "6",
    name: "Apple Watch Series 9 GPS + Cellular 45mm",
    price: 499.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
    rating: 4,
    reviews: 145,
    category: "smartwatches"
  },
  {
    id: "7",
    name: "PlayStation 5 Console + Extra Controller",
    price: 599.99,
    originalPrice: 649.99,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    rating: 5,
    reviews: 312,
    discount: 8,
    category: "gaming"
  },
  {
    id: "8",
    name: "Dell XPS 13 Plus Laptop - Intel i7 16GB RAM",
    price: 1599.99,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop",
    rating: 4,
    reviews: 78,
    category: "laptops"
  }
];

interface ProductGridProps {
  selectedCategory: string;
  searchQuery?: string;
}

const ProductGrid = ({ selectedCategory, searchQuery }: ProductGridProps) => {
  const [displayCount, setDisplayCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setProducts(mockProducts as any);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(mockProducts as any);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on selected category and search query
  let filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const loadMore = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setDisplayCount(prev => prev + 8);
      setLoading(false);
    }, 500);
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {searchQuery ? `Search Results for "${searchQuery}"` : 
           selectedCategory === "all" ? "All Products" : 
           `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
        </h2>
        <p className="text-muted-foreground">
          Showing {displayedProducts.length} of {filteredProducts.length} products
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? `No products found for "${searchQuery}"` : "No products found in this category."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                originalPrice={product.original_price}
                image={product.image_url}
                rating={product.rating}
                reviews={product.reviews}
                discount={product.discount}
                isNew={product.is_new}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="button-primary px-8 py-3"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Products"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;