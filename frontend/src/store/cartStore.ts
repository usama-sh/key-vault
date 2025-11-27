import { create } from 'zustand';
import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  isActive: boolean;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to add to cart');
    }
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/cart/item/${itemId}`, { quantity });
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to update cart');
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      set({ cart: response.data, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to remove item');
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await api.delete('/cart/clear');
      set({ cart: { id: '', items: [], total: 0 }, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
