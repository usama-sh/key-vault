import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config';

const prisma = new PrismaClient();

interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId: string;
  message: string;
  provider: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

// Simulate realistic payment processing with different providers
const simulatePayment = async (
  method: 'JAZZCASH' | 'EASYPAISA' | 'STRIPE',
  amount: number,
  phone?: string,
  cardDetails?: { last4: string; brand: string }
): Promise<PaymentResult> => {
  // Simulate network delay (1-3 seconds)
  const delay = 1000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  const timestamp = new Date().toISOString();
  const baseId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  
  // Generate provider-specific payment IDs
  let paymentId: string;
  let transactionId: string;
  
  switch (method) {
    case 'JAZZCASH':
      paymentId = `JC${baseId.toUpperCase()}`;
      transactionId = `TXN${Date.now()}`;
      break;
    case 'EASYPAISA':
      paymentId = `EP${baseId.toUpperCase()}`;
      transactionId = `EPTXN${Date.now()}`;
      break;
    case 'STRIPE':
      paymentId = `pi_${baseId}`;
      transactionId = `ch_${baseId}`;
      break;
    default:
      paymentId = `PAY_${baseId}`;
      transactionId = `TXN_${baseId}`;
  }
  
  return {
    success: true,
    paymentId,
    transactionId,
    message: `Payment processed successfully via ${method}`,
    provider: method,
    amount,
    currency: method === 'STRIPE' ? 'USD' : 'PKR',
    timestamp,
    status: 'completed',
  };
};

// JazzCash payment (Demo)
export const initiateJazzCashPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, phone, mpin } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Validate Pakistani phone format
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'Invalid Pakistani phone number format' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    console.log(`[JazzCash] Processing payment for order ${orderId}`);
    console.log(`[JazzCash] Amount: PKR ${order.totalAmount}, Phone: ${phone.slice(-4).padStart(phone.length, '*')}`);
    
    const result = await simulatePayment('JAZZCASH', order.totalAmount, phone);
    
    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: result.paymentId,
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });
      
      console.log(`[JazzCash] Payment successful: ${result.paymentId}`);
    }
    
    return res.json({
      success: result.success,
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      provider: 'JazzCash',
      amount: result.amount,
      currency: result.currency,
      timestamp: result.timestamp,
      message: result.message,
      demoMode: config.demoMode,
    });
  } catch (error) {
    console.error('JazzCash payment error:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
};

// EasyPaisa payment (Demo)
export const initiateEasyPaisaPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, phone, mpin } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Validate Pakistani phone format
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ message: 'Invalid Pakistani phone number format' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    console.log(`[EasyPaisa] Processing payment for order ${orderId}`);
    console.log(`[EasyPaisa] Amount: PKR ${order.totalAmount}, Phone: ${phone.slice(-4).padStart(phone.length, '*')}`);
    
    const result = await simulatePayment('EASYPAISA', order.totalAmount, phone);
    
    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: result.paymentId,
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });
      
      console.log(`[EasyPaisa] Payment successful: ${result.paymentId}`);
    }
    
    return res.json({
      success: result.success,
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      provider: 'EasyPaisa',
      amount: result.amount,
      currency: result.currency,
      timestamp: result.timestamp,
      message: result.message,
      demoMode: config.demoMode,
    });
  } catch (error) {
    console.error('EasyPaisa payment error:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
};

// Stripe payment (Demo)
export const initiateStripePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, cardNumber, expiryMonth, expiryYear, cvc } = req.body;
    
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc) {
      return res.status(400).json({ message: 'Card details are required' });
    }
    
    // Basic card validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      return res.status(400).json({ message: 'Invalid card number' });
    }
    
    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({ message: 'Invalid CVC' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.paymentStatus === 'COMPLETED') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    // Detect card brand
    let cardBrand = 'Unknown';
    if (cleanCardNumber.startsWith('4')) cardBrand = 'Visa';
    else if (/^5[1-5]/.test(cleanCardNumber)) cardBrand = 'Mastercard';
    else if (/^3[47]/.test(cleanCardNumber)) cardBrand = 'American Express';
    else if (/^6(?:011|5)/.test(cleanCardNumber)) cardBrand = 'Discover';
    
    const last4 = cleanCardNumber.slice(-4);
    
    console.log(`[Stripe] Processing payment for order ${orderId}`);
    console.log(`[Stripe] Amount: $${(order.totalAmount / 280).toFixed(2)}, Card: ${cardBrand} ****${last4}`);
    
    const result = await simulatePayment('STRIPE', order.totalAmount, undefined, { last4, brand: cardBrand });
    
    if (result.success) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: result.paymentId,
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED',
        },
      });
      
      console.log(`[Stripe] Payment successful: ${result.paymentId}`);
    }
    
    return res.json({
      success: result.success,
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      provider: 'Stripe',
      cardBrand,
      last4,
      amount: result.amount,
      currency: result.currency,
      timestamp: result.timestamp,
      message: result.message,
      demoMode: config.demoMode,
    });
  } catch (error) {
    console.error('Stripe payment error:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
};

// Verify payment status
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      orderId: order.id,
      paymentId: order.paymentId,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      amount: order.totalAmount,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};

// Get available payment methods
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  res.json({
    methods: [
      {
        id: 'JAZZCASH',
        name: 'JazzCash',
        description: "Pakistan's leading mobile wallet",
        color: '#ED1C24',
        currency: 'PKR',
        requiresPhone: true,
        requiresMpin: true,
        demoMode: config.demoMode,
      },
      {
        id: 'EASYPAISA',
        name: 'EasyPaisa',
        description: 'Fast & secure mobile payments',
        color: '#00A651',
        currency: 'PKR',
        requiresPhone: true,
        requiresMpin: true,
        demoMode: config.demoMode,
      },
      {
        id: 'STRIPE',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Amex accepted',
        color: '#635BFF',
        currency: 'USD',
        requiresCard: true,
        supportedCards: ['visa', 'mastercard', 'amex', 'discover'],
        demoMode: config.demoMode,
      },
    ],
    demoMode: config.demoMode,
  });
};
