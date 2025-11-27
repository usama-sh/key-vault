import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin Dashboard Stats
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
    ]);
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    
    const where: any = {};
    if (role) where.role = role;
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (id === req.user!.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get all products (admin view with inactive ones)
export const getAllProductsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json(products);
  } catch (error) {
    console.error('Get all products admin error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Toggle product active status
export const toggleProductStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Create admin user (for seeding)
export const createAdminUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
  });
};
