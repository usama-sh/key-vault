import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001'),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  demoMode: process.env.DEMO_MODE === 'true',
  
  // JazzCash
  jazzCash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
    password: process.env.JAZZCASH_PASSWORD || '',
    salt: process.env.JAZZCASH_SALT || '',
  },
  
  // EasyPaisa
  easyPaisa: {
    storeId: process.env.EASYPAISA_STORE_ID || '',
    hashKey: process.env.EASYPAISA_HASH_KEY || '',
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
};
