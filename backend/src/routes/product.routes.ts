import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Seller/Admin routes
router.post(
  '/',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  upload.single('image'),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  upload.single('image'),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  deleteProduct
);

// Seller-specific routes
router.get(
  '/seller/my-products',
  authenticate,
  authorize('SELLER', 'ADMIN'),
  getSellerProducts
);

export default router;
