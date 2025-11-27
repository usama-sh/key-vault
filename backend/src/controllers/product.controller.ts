import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, sellerId } = req.query;
    
    const where: any = {
      isActive: true,
    };
    
    if (category) {
      where.category = category as string;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    
    if (sellerId) {
      where.sellerId = sellerId as string;
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '/placeholder-keyboard.jpg';
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category: category || 'keyboard',
        image,
        sellerId: req.user!.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, isActive } = req.body;
    
    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (existingProduct.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (existingProduct.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await prisma.product.delete({
      where: { id },
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: req.user!.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};
