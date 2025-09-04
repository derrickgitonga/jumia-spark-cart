import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: "",
    paymentMethod: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = getTotalPrice();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!checkoutData.shippingAddress || !checkoutData.paymentMethod || !checkoutData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice,
          status: 'pending',
          payment_method: checkoutData.paymentMethod,
          shipping_address: checkoutData.shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: "Thank you for making an order, wait for approval",
        description: `Order #${order.id.substring(0, 8)} has been submitted. Track your order progress in the Orders page.`,
      });

      // Clear cart after successful order
      clearCart();
      
      navigate("/orders");

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-8">You need to sign in to view your cart</p>
          <Button onClick={() => navigate("/auth")} className="button-primary">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some items to get started</p>
            <Button onClick={() => navigate("/")} className="button-primary">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.products.description}
                        </p>
                        <p className="font-bold text-primary">
                          ${item.products.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full address"
                      value={checkoutData.shippingAddress}
                      onChange={(e) => setCheckoutData({ ...checkoutData, shippingAddress: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Method *</Label>
                    <Select
                      value={checkoutData.paymentMethod}
                      onValueChange={(value) => setCheckoutData({ ...checkoutData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your order will be reviewed by our admin team. 
                      Payment instructions will be sent via email once approved.
                    </p>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full button-primary"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;