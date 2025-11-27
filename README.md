# KeyboardHub - E-Commerce Website

A fully functional keyboard e-commerce website with JazzCash/EasyPaisa/Stripe payment integration (demo mode), role-based access control, and complete shopping cart functionality.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Setup Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed   # Seeds demo data
npm run dev       # Starts on http://localhost:5001
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:3000
```

## 🌐 Deploy to Vercel

### Step 1: Create a PostgreSQL Database

Get a free PostgreSQL database from one of these providers:
- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** (Recommended - integrates seamlessly)
- **[Neon](https://neon.tech)** (Free tier available)
- **[Supabase](https://supabase.com)** (Free tier available)

Copy the connection string (looks like: `postgresql://user:pass@host:5432/db`)

### Step 2: Deploy Backend

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import the `backend` folder
4. Add these environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=https://your-frontend.vercel.app
   DEMO_MODE=true
   ```
5. Deploy!

After deployment, run the seed script:
```bash
cd backend
DATABASE_URL="your-production-db-url" npx prisma db push
DATABASE_URL="your-production-db-url" npx tsx src/seed.ts
```

### Step 3: Deploy Frontend

1. Create another Vercel project
2. Import the `frontend` folder
3. Add this environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
   ```
4. Deploy!

### Step 4: Update CORS

Go to your backend Vercel project and update `FRONTEND_URL` to your actual frontend URL.

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@keyboards.pk | admin123 |
| Seller | seller@keyboards.pk | seller123 |
| User | user@test.com | user123 |

## 💳 Payment Methods

All payments are in **Demo Mode** - they simulate real payment processing:

- **JazzCash** - Mobile wallet (Pakistan)
- **EasyPaisa** - Mobile wallet (Pakistan)
- **Stripe** - Credit/Debit cards (Visa, Mastercard, Amex)

### Test Cards for Stripe:
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- Expiry: Any future date, CVC: Any 3 digits

## 🛡️ Role-Based Access

### User
- Browse products
- Add to cart
- Checkout with payment
- View order history

### Seller
- Everything a User can do
- Add/Edit/Delete own products
- View orders for their products
- Seller dashboard with stats

### Admin
- Full access to everything
- Manage all users (change roles)
- Manage all products
- Manage all orders
- Admin dashboard with analytics

## 🏗️ Project Structure

```
ecom/
├── backend/
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── config/      # App configuration
│   │   ├── controllers/ # API controllers
│   │   ├── middleware/  # Auth, upload, error handling
│   │   ├── routes/      # API routes
│   │   └── index.ts     # Server entry point
│   └── vercel.json      # Vercel config
│
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities
│   │   └── store/       # Zustand stores
│   └── vercel.json      # Vercel config
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product (Owner/Admin)
- `DELETE /api/products/:id` - Delete product (Owner/Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item/:id` - Update quantity
- `DELETE /api/cart/item/:id` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

### Payments
- `GET /api/payments/methods` - Get available methods
- `POST /api/payments/jazzcash` - Process JazzCash payment
- `POST /api/payments/easypaisa` - Process EasyPaisa payment
- `POST /api/payments/stripe` - Process Stripe payment

## 📱 Features

- ✅ Product catalog with search and filters
- ✅ Shopping cart with quantity management
- ✅ Checkout with multiple payment options
- ✅ Order tracking and history
- ✅ User authentication with JWT
- ✅ Role-based dashboards
- ✅ Product image uploads
- ✅ Responsive design
- ✅ Demo payment mode
- ✅ Vercel deployment ready

---

Made with ❤️ for keyboard enthusiasts
