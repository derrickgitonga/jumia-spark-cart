import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced search with similarity scoring
  const getSearchScore = (product: Product, query: string): number => {
    const lowerQuery = query.toLowerCase();
    const lowerName = product.name.toLowerCase();
    const lowerDescription = product.description.toLowerCase();
    const lowerBrand = product.brand?.toLowerCase() || '';
    const lowerCategory = product.category.toLowerCase();
    
    let score = 0;
    
    // Exact matches get highest score
    if (lowerName.includes(lowerQuery)) score += 100;
    if (lowerBrand.includes(lowerQuery)) score += 80;
    if (lowerDescription.includes(lowerQuery)) score += 60;
    if (lowerCategory.includes(lowerQuery)) score += 40;
    
    // Partial word matches
    const queryWords = lowerQuery.split(' ');
    const productWords = [...lowerName.split(' '), ...lowerDescription.split(' '), ...lowerBrand.split(' ')];
    
    queryWords.forEach(queryWord => {
      productWords.forEach(productWord => {
        if (productWord.includes(queryWord) && queryWord.length > 2) {
          score += 20;
        }
        // Fuzzy matching for similar words
        if (queryWord.length > 3 && productWord.length > 3) {
          const similarity = calculateSimilarity(queryWord, productWord);
          if (similarity > 0.7) score += 15;
        }
      });
    });
    
    // Category and brand similarity for related items
    if (!lowerName.includes(lowerQuery) && !lowerDescription.includes(lowerQuery)) {
      if (products.some(p => p.name.toLowerCase().includes(lowerQuery) && p.category === product.category)) {
        score += 10;
      }
      if (products.some(p => p.name.toLowerCase().includes(lowerQuery) && p.brand === product.brand)) {
        score += 15;
      }
    }
    
    return score;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    window.location.reload(); // Reload to update results
  };

  // Filter and sort products based on search query
  const searchResults = query
    ? products
        .map(product => ({
          ...product,
          searchScore: getSearchScore(product, query)
        }))
        .filter(product => product.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore)
    : [];

  const displayedProducts = searchResults.slice(0, displayCount);
  const hasMore = displayCount < searchResults.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={handleSearch} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">
              Search Results for "{query}"
            </h1>
            <p className="text-muted-foreground">
              Found {searchResults.length} products matching your search
            </p>
          </div>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No products found</h2>
            <p className="text-muted-foreground mb-8">
              Try adjusting your search terms or browse our categories
            </p>
            <Button onClick={() => navigate('/')} className="button-primary">
              Browse All Products
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer"
                >
                  <ProductCard 
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
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-12">
                <Button
                  onClick={loadMore}
                  className="button-primary px-8 py-3"
                  size="lg"
                >
                  Load More Results
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;