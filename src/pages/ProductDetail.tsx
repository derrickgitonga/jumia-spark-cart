import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        navigate('/404');
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (product) {
      await addToCart(product.id);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product?.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/')} className="button-primary">
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const getDetailedSpecs = (category: string, name: string) => {
    const baseSpecs = {
      Brand: product.brand || "Premium",
      Category: category,
      Rating: `${product.rating}/5 stars`,
      Reviews: `${product.reviews} customer reviews`,
    };

    switch (category.toLowerCase()) {
      case 'smartphones':
        return {
          ...baseSpecs,
          Display: "6.7-inch Super Retina XDR",
          Processor: "A17 Pro chip",
          Storage: "256GB",
          Camera: "48MP Main + 12MP Ultra Wide",
          Battery: "All-day battery life",
          Connectivity: "5G, Wi-Fi 6E, Bluetooth 5.3",
          OS: "Latest mobile OS",
          Water_Resistance: "IP68",
        };
      case 'laptops':
        return {
          ...baseSpecs,
          Display: "14-inch Liquid Retina XDR",
          Processor: "M3 Pro 11-core CPU",
          Memory: "16GB unified memory",
          Storage: "512GB SSD",
          Graphics: "14-core GPU",
          Battery: "Up to 18 hours",
          Ports: "3x Thunderbolt 4, HDMI, SD card",
          OS: "Latest desktop OS",
        };
      case 'headphones':
        return {
          ...baseSpecs,
          Type: "Over-ear wireless",
          Noise_Cancellation: "Industry-leading ANC",
          Battery: "30 hours with ANC",
          Drivers: "40mm dynamic drivers",
          Frequency_Response: "4Hz-40kHz",
          Connectivity: "Bluetooth 5.2, 3.5mm jack",
          Weight: "250g",
          Features: "Touch controls, voice assistant",
        };
      case 'smartwatches':
        return {
          ...baseSpecs,
          Display: "1.9-inch Always-On Retina",
          Processor: "S9 SiP dual-core",
          Storage: "64GB",
          Health_Features: "ECG, Blood Oxygen, Heart Rate",
          Battery: "18 hours all-day",
          Water_Resistance: "50 meters",
          Connectivity: "GPS + Cellular",
          Compatibility: "iOS/Android compatible",
        };
      default:
        return {
          ...baseSpecs,
          Features: "Premium build quality",
          Warranty: "1 year manufacturer warranty",
          Connectivity: "Latest connectivity options",
          Design: "Modern and sleek design",
        };
    }
  };

  const specs = getDetailedSpecs(product.category, product.name);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_new && <Badge className="bg-success text-success-foreground">New</Badge>}
              {product.discount && (
                <Badge className="bg-destructive text-destructive-foreground">
                  -{product.discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= product.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="button-primary flex-1"
                onClick={handleAddToCart}
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={handleWishlist}
                size="lg"
                className={`px-6 ${
                  isWishlisted 
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                    : ""
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Specifications */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <dt className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="mt-1 text-base">{value}</dd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;