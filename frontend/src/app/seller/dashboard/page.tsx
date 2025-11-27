'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, ShoppingCart, DollarSign, Plus, Edit, Trash2, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore, Product } from '@/store';

interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'add'>('overview');
  
  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'mechanical',
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !['SELLER', 'ADMIN'].includes(user?.role || '')) {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, productsRes, ordersRes] = await Promise.all([
          api.get('/seller/stats'),
          api.get('/seller/products'),
          api.get('/seller/orders'),
        ]);
        setStats(statsRes.data);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, router]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('category', newProduct.category);
      if (productImage) {
        formData.append('image', productImage);
      }

      const response = await api.post('/seller/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProducts([response.data, ...products]);
      setNewProduct({ name: '', description: '', price: '', stock: '', category: 'mechanical' });
      setProductImage(null);
      setActiveTab('products');
      toast.success('Product added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/seller/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (!isAuthenticated || !['SELLER', 'ADMIN'].includes(user?.role || '')) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your products and orders</p>
        </div>
        <Badge className="text-sm">
          <Store className="mr-1 h-4 w-4" />
          Seller Access
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        {(['overview', 'products', 'orders', 'add'] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'add' ? '+ Add Product' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Products</p>
                    <p className="text-2xl font-bold">{stats?.activeProducts || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={() => setActiveTab('add')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('products')}>
                <Package className="mr-2 h-4 w-4" />
                View Products
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('orders')}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'products' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Products</CardTitle>
            <Button onClick={() => setActiveTab('add')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600">No products yet</p>
                <Button className="mt-4" onClick={() => setActiveTab('add')}>
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <Badge 
                        className="absolute top-2 right-2"
                        variant={product.isActive ? 'success' : 'secondary'}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {product.stock}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Orders for My Products</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Order ID</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Products</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2 font-mono">{order.orderNumber.slice(-8)}</td>
                        <td className="py-2">{order.user.name}</td>
                        <td className="py-2">
                          {order.items.map(item => (
                            <div key={item.product.name} className="text-xs">
                              {item.product.name} × {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="py-2">
                          <Badge>{order.status}</Badge>
                        </td>
                        <td className="py-2">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'add' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., Keychron K8 Pro"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe your keyboard..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (PKR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="15999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="25"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="mechanical">Mechanical</option>
                  <option value="gaming">Gaming</option>
                  <option value="wireless">Wireless</option>
                  <option value="compact">Compact</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImage(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to use a placeholder image
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
