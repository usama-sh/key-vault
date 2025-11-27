'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore, useCartStore, Product } from '@/store';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${params.id}`);
        setProduct(response.data);
      } catch (error) {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product!.id, quantity);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Details */}
        <div>
          <Badge className="mb-4">{product.category}</Badge>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            <Badge variant={product.stock > 0 ? 'success' : 'destructive'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </Badge>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {product.seller && (
            <p className="mt-4 text-sm text-gray-500">
              Sold by: <span className="font-medium">{product.seller.name}</span>
            </p>
          )}

          {/* Quantity Selector */}
          <div className="mt-8">
            <label className="text-sm font-medium">Quantity</label>
            <div className="mt-2 flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-medium">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {adding ? 'Adding...' : 'Add to Cart'}
          </Button>

          {/* Features */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Why Choose This Keyboard?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Premium mechanical switches
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  RGB backlighting (if applicable)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  1-year manufacturer warranty
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Free shipping across Pakistan
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
