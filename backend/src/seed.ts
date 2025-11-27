import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const keyboardProducts = [
  {
    name: 'Keychron K8 Pro',
    description: 'Hot-swappable wireless mechanical keyboard with RGB backlight, Gateron G Pro switches, and aluminum frame. Perfect for both Mac and Windows.',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
    stock: 25,
    category: 'mechanical',
  },
  {
    name: 'Ducky One 3 TKL',
    description: 'Premium tenkeyless mechanical keyboard with Cherry MX switches, PBT keycaps, and hot-swappable PCB. RGB lighting with multiple effects.',
    price: 18999,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
    stock: 15,
    category: 'mechanical',
  },
  {
    name: 'Logitech G Pro X',
    description: 'Professional gaming keyboard with swappable switches, LIGHTSYNC RGB, and compact tenkeyless design. Detachable cable for portability.',
    price: 21999,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500',
    stock: 30,
    category: 'gaming',
  },
  {
    name: 'Royal Kludge RK84',
    description: 'Wireless tri-mode mechanical keyboard (Bluetooth/2.4GHz/Wired) with hot-swappable switches, RGB backlight, and compact 75% layout.',
    price: 8999,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    stock: 50,
    category: 'wireless',
  },
  {
    name: 'Anne Pro 2',
    description: '60% wireless mechanical keyboard with Gateron switches, full RGB, and programmable keys. Bluetooth 4.0 and USB-C connectivity.',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    stock: 20,
    category: 'compact',
  },
  {
    name: 'GMMK Pro',
    description: 'Premium 75% gasket-mounted keyboard with rotary encoder, south-facing RGB, and aluminum case. Fully customizable with any MX-style switch.',
    price: 28999,
    image: 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=500',
    stock: 10,
    category: 'premium',
  },
  {
    name: 'Akko 3068B Plus',
    description: 'Compact 65% wireless keyboard with Akko CS switches, PBT dye-sub keycaps, and multi-device Bluetooth. Retro aesthetic design.',
    price: 9499,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500',
    stock: 35,
    category: 'wireless',
  },
  {
    name: 'Corsair K70 RGB MK.2',
    description: 'Full-size gaming keyboard with Cherry MX Speed switches, per-key RGB, and dedicated media controls. Aircraft-grade aluminum frame.',
    price: 24999,
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=500',
    stock: 18,
    category: 'gaming',
  },
  {
    name: 'Leopold FC660M',
    description: 'Legendary 65% keyboard with Cherry MX switches, PBT doubleshot keycaps, and premium build quality. No RGB, pure typing experience.',
    price: 16999,
    image: 'https://images.unsplash.com/photo-1618499890638-3a0dd4b278e4?w=500',
    stock: 12,
    category: 'premium',
  },
  {
    name: 'Razer Huntsman V2',
    description: 'Optical gaming keyboard with near-zero input latency, doubleshot PBT keycaps, and sound dampening foam. Premium esports-grade performance.',
    price: 32999,
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=500',
    stock: 22,
    category: 'gaming',
  },
  {
    name: 'NuPhy Air75',
    description: 'Ultra-slim wireless mechanical keyboard with low-profile switches, Mac optimization, and RGB backlight. Only 16mm thin with amazing typing feel.',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1560131914-2e469a0e8607?w=500',
    stock: 28,
    category: 'wireless',
  },
  {
    name: 'Drop CTRL',
    description: 'High-profile tenkeyless keyboard with hot-swap sockets, aluminum frame, and fully programmable QMK/VIA support. RGB underglow and per-key lighting.',
    price: 35999,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    stock: 8,
    category: 'premium',
  },
];

async function seed() {
  console.log('🌱 Starting seed...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@keyboards.pk' },
    update: {},
    create: {
      email: 'admin@keyboards.pk',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '+92300000000',
      address: 'Karachi, Pakistan',
    },
  });
  console.log('✅ Admin user created:', admin.email);
  
  // Create seller user
  const sellerPassword = await bcrypt.hash('seller123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@keyboards.pk' },
    update: {},
    create: {
      email: 'seller@keyboards.pk',
      password: sellerPassword,
      name: 'Keyboard Seller',
      role: 'SELLER',
      phone: '+92311111111',
      address: 'Lahore, Pakistan',
    },
  });
  console.log('✅ Seller user created:', seller.email);
  
  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER',
      phone: '+92322222222',
      address: 'Islamabad, Pakistan',
      cart: {
        create: {},
      },
    },
  });
  console.log('✅ Test user created:', user.email);
  
  // Create products
  for (const product of keyboardProducts) {
    await prisma.product.upsert({
      where: { 
        id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}` 
      },
      update: { ...product },
      create: {
        id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...product,
        sellerId: seller.id,
      },
    });
  }
  console.log(`✅ Created ${keyboardProducts.length} keyboard products`);
  
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Admin: admin@keyboards.pk / admin123');
  console.log('   Seller: seller@keyboards.pk / seller123');
  console.log('   User: user@test.com / user123');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
