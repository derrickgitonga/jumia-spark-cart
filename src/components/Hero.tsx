import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";
import heroImage from "@/assets/hero-electronics.jpg";

const Hero = () => {
  return (
    <section className="hero-section py-20 lg:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Electronics That
                <br />
                <span className="text-primary-glow">Power Your Life</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-lg">
                Discover the latest smartphones, laptops, headphones and more. 
                Quality electronics with fast delivery and unbeatable prices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="button-primary px-8 py-6 text-lg font-semibold group"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                View Categories
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Fast Delivery</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Warranty</p>
              </div>
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Free Shipping</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Latest Electronics"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-background rounded-lg shadow-lg p-4 animate-pulse">
              <div className="text-sm font-semibold text-success">50% OFF</div>
              <div className="text-xs text-muted-foreground">Limited Time</div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-background rounded-lg shadow-lg p-4">
              <div className="text-sm font-semibold">Free Delivery</div>
              <div className="text-xs text-muted-foreground">On orders $50+</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-glow/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-primary/10 to-transparent" />
    </section>
  );
};

export default Hero;