import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, User, Menu, X, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              Simple PAY <span className="text-primary-glow">Global</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center px-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 button-primary h-8 px-3"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="hover:bg-muted transition-colors">
                  <Shield className="w-5 h-5" />
                </Button>
              </Link>
              
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative hover:bg-muted transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              {user ? (
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="text-sm hover:bg-muted transition-colors"
                >
                  Logout
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="hover:bg-muted transition-colors">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 button-primary h-8 px-3"
                  >
                    Search
                  </Button>
                </div>
              </form>
              
              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                <Link to="/admin" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors">
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
                
                <Link to="/cart" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
                
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="justify-start hover:bg-muted transition-colors"
                  >
                    Logout
                  </Button>
                ) : (
                  <Link to="/auth" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <User className="w-5 h-5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;