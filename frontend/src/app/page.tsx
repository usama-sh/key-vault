'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Keyboard, Zap, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { Product } from '@/store/cartStore';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const features = [
    {
      icon: Keyboard,
      title: 'Premium Quality',
      description: 'Only the finest mechanical keyboards from trusted brands',
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      description: 'Quick shipping across Pakistan within 2-3 business days',
    },
    {
      icon: Shield,
      title: 'Warranty Protected',
      description: 'All products come with manufacturer warranty',
    },
    {
      icon: Truck,
      title: 'Easy Returns',
      description: '7-day hassle-free return policy',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white">
                🎉 Demo Mode Active
              </Badge>
              <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
                Premium Mechanical Keyboards for Every Enthusiast
              </h1>
              <p className="mt-6 text-lg text-primary-100">
                Discover our curated collection of the finest mechanical keyboards. 
                From gaming to professional typing, find your perfect match.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <span>JazzCash</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <span>EasyPaisa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧪</span>
                  <span>Test Pay</span>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative h-[400px] w-full">
                <Image
                  src="https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800"
                  alt="Mechanical Keyboard"
                  fill
                  className="rounded-lg object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="mx-auto h-12 w-12 text-primary-600" />
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured Keyboards</h2>
              <p className="mt-1 text-gray-600">Top picks for keyboard enthusiasts</p>
            </div>
            <Link href="/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <Badge className="absolute right-2 top-2">{product.category}</Badge>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(product.price)}
                        </span>
                        <Badge variant={product.stock > 0 ? 'success' : 'destructive'}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold">Ready to Level Up Your Typing?</h2>
              <p className="mt-4 text-primary-100">
                Join thousands of satisfied customers who found their perfect keyboard.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
