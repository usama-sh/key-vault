import { Router } from 'express';
import {
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { getSellerOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize('SELLER', 'ADMIN'));

// Dashboard stats
router.get('/stats', async (req: any, res) => {
  try {
    const sellerId = req.user!.id;
    
    const [totalProducts, activeProducts, orders] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.product.count({ where: { sellerId, isActive: true } }),
      prisma.order.findMany({
        where: {
          items: {
            some: {
              product: { sellerId },
            },
          },
        },
        include: {
          items: {
            where: {
              product: { sellerId },
            },
          },
        },
      }),
    ]);
    
    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
      0
    );
    
    res.json({
      totalProducts,
      activeProducts,
      totalOrders: orders.length,
      totalRevenue,
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Products
router.get('/products', getSellerProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
