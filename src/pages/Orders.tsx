import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package, CheckCircle, XCircle, Clock } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address?: string;
  payment_method?: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    image_url: string;
    brand?: string;
  };
}

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url, brand)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Waiting for Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Order Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />Order Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return "Your order is being reviewed by our team. You'll receive a notification once it's approved.";
      case 'approved':
        return "Great news! Your order has been approved and is being processed for delivery.";
      case 'rejected':
        return "Unfortunately, your order was cancelled. Please contact support for more information.";
      default:
        return "";
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Your Orders</h1>
            <p className="text-muted-foreground">Track your order progress</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button onClick={() => navigate("/")} className="button-primary">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-semibold mt-2">${Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">{getStatusMessage(order.status)}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Order Items</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <img
                          src={item.products?.image_url || "/placeholder.svg"}
                          alt={item.products?.name || "Product"}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.products?.name}</h5>
                          {item.products?.brand && (
                            <p className="text-sm text-muted-foreground">{item.products.brand}</p>
                          )}
                          <p className="text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${Number(item.unit_price).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">per item</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.shipping_address && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                      <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                    </div>
                  )}

                  {order.payment_method && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Payment Method</h4>
                      <p className="text-sm text-muted-foreground capitalize">{order.payment_method}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Orders;