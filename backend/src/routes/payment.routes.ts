import { Router } from 'express';
import {
  initiateJazzCashPayment,
  initiateEasyPaisaPayment,
  initiateStripePayment,
  verifyPayment,
  getPaymentMethods,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/methods', getPaymentMethods);
router.post('/jazzcash', initiateJazzCashPayment);
router.post('/easypaisa', initiateEasyPaisaPayment);
router.post('/stripe', initiateStripePayment);
router.get('/verify/:orderId', verifyPayment);

export default router;
