import { useState } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Mock product data - this would come from an API in a real application
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
}

const ProductGrid = ({ selectedCategory }: ProductGridProps) => {
  const [displayCount, setDisplayCount] = useState(8);
  const [loading, setLoading] = useState(false);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

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

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {selectedCategory === "all" ? "All Products" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
        </h2>
        <p className="text-muted-foreground">
          Showing {displayedProducts.length} of {filteredProducts.length} products
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found in this category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
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