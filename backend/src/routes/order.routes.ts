import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getSellerOrders,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', authorize('ADMIN'), getAllOrders);
router.put('/:id/status', authorize('ADMIN', 'SELLER'), updateOrderStatus);

// Seller routes
router.get('/seller/orders', authorize('SELLER', 'ADMIN'), getSellerOrders);

export default router;
