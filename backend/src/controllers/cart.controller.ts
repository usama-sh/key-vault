import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    
    // Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    res.json({ ...cart, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
      });
    }
    
    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });
    
    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }
    
    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    res.json({ ...updatedCart, total });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Check item exists and belongs to user
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
      },
    });
    
    if (!item || item.cart.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    
    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    res.json({ ...updatedCart, total });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    
    // Check item exists and belongs to user
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });
    
    if (!item || item.cart.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    
    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    
    res.json({ ...updatedCart, total });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });
    
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    
    res.json({ message: 'Cart cleared', items: [], total: 0 });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};
