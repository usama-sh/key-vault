'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store';

type PaymentMethod = 'JAZZCASH' | 'EASYPAISA' | 'STRIPE';

// SVG Logos for payment methods
const JazzCashLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 w-auto">
    <rect width="120" height="40" rx="4" fill="#ED1C24"/>
    <text x="10" y="27" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16">JazzCash</text>
  </svg>
);

const EasyPaisaLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 w-auto">
    <rect width="120" height="40" rx="4" fill="#00A651"/>
    <text x="10" y="27" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14">EasyPaisa</text>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 w-auto">
    <rect width="120" height="40" rx="4" fill="#635BFF"/>
    <text x="25" y="27" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16">Stripe</text>
  </svg>
);

// Card brand logos
const VisaLogo = () => (
  <svg viewBox="0 0 50 16" className="h-4 w-auto">
    <rect width="50" height="16" rx="2" fill="#1A1F71"/>
    <text x="8" y="12" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="10">VISA</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 50 16" className="h-4 w-auto">
    <rect width="50" height="16" rx="2" fill="#EB001B"/>
    <circle cx="18" cy="8" r="6" fill="#EB001B"/>
    <circle cx="32" cy="8" r="6" fill="#F79E1B"/>
    <ellipse cx="25" cy="8" rx="3" ry="5" fill="#FF5F00"/>
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 50 16" className="h-4 w-auto">
    <rect width="50" height="16" rx="2" fill="#006FCF"/>
    <text x="5" y="11" fill="white" fontFamily="Arial" fontWeight="bold" fontSize="7">AMEX</text>
  </svg>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('STRIPE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [mpin, setMpin] = useState('');
  
  // Card details for Stripe
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('');
  
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
    if (user?.phone) setPhone(user.phone);
    if (user?.address) setAddress(user.address);
  }, [isAuthenticated, fetchCart, router, user]);

  // Detect card brand from card number
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^5[1-5]/.test(cleanNumber)) {
      setCardBrand('mastercard');
    } else if (/^3[47]/.test(cleanNumber)) {
      setCardBrand('amex');
    } else {
      setCardBrand('');
    }
  }, [cardNumber]);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      toast.error('Please enter your shipping address');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!cart?.items?.length) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate payment method specific fields
    if (selectedMethod === 'STRIPE') {
      if (!cardNumber || !expiryMonth || !expiryYear || !cvc) {
        toast.error('Please enter all card details');
        return;
      }
    }

    setProcessing(true);

    try {
      // Step 1: Create order
      setProcessingStep('Creating order...');
      await new Promise(r => setTimeout(r, 500));
      
      const orderResponse = await api.post('/orders', {
        paymentMethod: selectedMethod,
        shippingAddress: address,
        phone: phone,
      });
      
      const order = orderResponse.data;
      
      // Step 2: Process payment
      setProcessingStep(`Connecting to ${selectedMethod === 'STRIPE' ? 'Stripe' : selectedMethod === 'JAZZCASH' ? 'JazzCash' : 'EasyPaisa'}...`);
      await new Promise(r => setTimeout(r, 800));
      
      setProcessingStep('Verifying payment details...');
      await new Promise(r => setTimeout(r, 600));
      
      let paymentEndpoint = '/payments/stripe';
      let paymentData: any = { orderId: order.id };
      
      if (selectedMethod === 'JAZZCASH') {
        paymentEndpoint = '/payments/jazzcash';
        paymentData = { orderId: order.id, phone, mpin };
      } else if (selectedMethod === 'EASYPAISA') {
        paymentEndpoint = '/payments/easypaisa';
        paymentData = { orderId: order.id, phone, mpin };
      } else {
        paymentData = {
          orderId: order.id,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear,
          cvc,
        };
      }
      
      setProcessingStep('Processing payment...');
      
      const paymentResponse = await api.post(paymentEndpoint, paymentData);
      
      if (paymentResponse.data.success) {
        setProcessingStep('Payment successful!');
        await new Promise(r => setTimeout(r, 500));
        
        setOrderId(order.id);
        setPaymentDetails(paymentResponse.data);
        setOrderComplete(true);
        await clearCart();
        toast.success('Payment successful!');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-600">Payment Successful!</h1>
            <p className="mt-4 text-gray-600">
              Thank you for your order. Your payment has been processed.
            </p>
            
            {/* Payment Receipt */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="font-mono text-sm font-semibold">{orderId?.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment ID</span>
                <span className="font-mono text-sm font-semibold">{paymentDetails?.paymentId?.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Provider</span>
                <span className="text-sm font-semibold">{paymentDetails?.provider}</span>
              </div>
              {paymentDetails?.cardBrand && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Card</span>
                  <span className="text-sm font-semibold">{paymentDetails.cardBrand} ****{paymentDetails.last4}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-semibold">{formatPrice(paymentDetails?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time</span>
                <span className="text-sm">{new Date(paymentDetails?.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <Badge className="mt-4 bg-yellow-100 text-yellow-800">
              Demo Mode - No real charges
            </Badge>
            
            <div className="mt-8 flex gap-4 justify-center">
              <Button onClick={() => router.push(`/orders/${orderId}`)}>
                View Order
              </Button>
              <Button variant="outline" onClick={() => router.push('/products')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-600">Your cart is empty</p>
            <Button className="mt-4" onClick={() => router.push('/products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 3XX XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Street, City, Province"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* JazzCash */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMethod === 'JAZZCASH'
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                  onClick={() => setSelectedMethod('JAZZCASH')}
                >
                  <div className="flex-shrink-0">
                    <JazzCashLogo />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">JazzCash</p>
                    <p className="text-sm text-gray-600">Pakistan&apos;s leading mobile wallet</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'JAZZCASH'}
                    onChange={() => setSelectedMethod('JAZZCASH')}
                    className="h-5 w-5 text-red-600"
                  />
                </div>

                {/* EasyPaisa */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMethod === 'EASYPAISA'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                  onClick={() => setSelectedMethod('EASYPAISA')}
                >
                  <div className="flex-shrink-0">
                    <EasyPaisaLogo />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">EasyPaisa</p>
                    <p className="text-sm text-gray-600">Fast & secure mobile payments</p>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'EASYPAISA'}
                    onChange={() => setSelectedMethod('EASYPAISA')}
                    className="h-5 w-5 text-green-600"
                  />
                </div>

                {/* Stripe */}
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedMethod === 'STRIPE'
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                  onClick={() => setSelectedMethod('STRIPE')}
                >
                  <div className="flex-shrink-0">
                    <StripeLogo />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Credit / Debit Card</p>
                    <div className="flex items-center gap-2 mt-1">
                      <VisaLogo />
                      <MastercardLogo />
                      <AmexLogo />
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'STRIPE'}
                    onChange={() => setSelectedMethod('STRIPE')}
                    className="h-5 w-5 text-indigo-600"
                  />
                </div>

                {/* Payment Details Form */}
                {(selectedMethod === 'JAZZCASH' || selectedMethod === 'EASYPAISA') && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 border">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {selectedMethod === 'JAZZCASH' ? <JazzCashLogo /> : <EasyPaisaLogo />}
                      <span>Account Details</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="wallet-phone" className="text-sm">Wallet Phone Number</Label>
                        <Input
                          id="wallet-phone"
                          type="tel"
                          placeholder="03XX XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="mpin" className="text-sm">MPIN (4 digits)</Label>
                        <Input
                          id="mpin"
                          type="password"
                          placeholder="****"
                          maxLength={4}
                          value={mpin}
                          onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="bg-white"
                        />
                        <p className="text-xs text-gray-500">Demo mode - any 4 digits work</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'STRIPE' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 border">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      Card Details
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="card-number" className="text-sm">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="card-number"
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                            className="bg-white pr-16"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {cardBrand === 'visa' && <VisaLogo />}
                            {cardBrand === 'mastercard' && <MastercardLogo />}
                            {cardBrand === 'amex' && <AmexLogo />}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="expiry-month" className="text-sm">Month</Label>
                          <Input
                            id="expiry-month"
                            type="text"
                            placeholder="MM"
                            maxLength={2}
                            value={expiryMonth}
                            onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="expiry-year" className="text-sm">Year</Label>
                          <Input
                            id="expiry-year"
                            type="text"
                            placeholder="YY"
                            maxLength={2}
                            value={expiryYear}
                            onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="cvc" className="text-sm">CVC</Label>
                          <Input
                            id="cvc"
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <AlertCircle className="h-4 w-4" />
                        Demo mode - Use test card: 4242 4242 4242 4242
                      </div>
                    </div>
                  </div>
                )}

                {/* Demo Mode Notice */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <span>
                      <strong>Demo Mode:</strong> All payments are simulated. No real money will be charged.
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.product.image.startsWith('http') ? item.product.image : `http://localhost:5001${item.product.image}`}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{processingStep}</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Pay {formatPrice(total)}
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Secure checkout powered by demo gateway
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
