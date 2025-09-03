import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, Users, DollarSign } from "lucide-react";

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address?: string;
  payment_method?: string;
  order_items: OrderItem[];
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  products?: {
    name: string;
    image_url: string;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });

  const ADMIN_PASSWORD = "admin123"; // In production, this should be properly secured

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchOrders();
      fetchStats();
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid admin password",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, image_url)
          ),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'approved');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        totalCustomers: totalCustomers || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Order updated",
        description: `Order ${newStatus} successfully`,
      });

      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdminLogin} className="button-primary flex-1">
                Login
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
              <h1 className="text-2xl font-bold">Simple PAY Global - Admin Panel</h1>
            </div>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Order Management</h2>
              <Button onClick={fetchOrders} variant="outline">
                Refresh Orders
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.profiles?.full_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.profiles?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.order_items.slice(0, 2).map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.products?.name} x{item.quantity}
                              </div>
                            ))}
                            {order.order_items.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{order.order_items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(order.total_amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {order.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;