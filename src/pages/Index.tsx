import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory("all"); // Reset category when searching
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      <main>
        <Hero />
        
        {/* Products Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Featured Electronics</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our curated selection of the latest and greatest electronic devices. 
                From cutting-edge smartphones to powerful laptops, find everything you need.
              </p>
            </div>
            
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
