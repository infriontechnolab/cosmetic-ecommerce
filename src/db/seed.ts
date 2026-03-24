import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  roles,
  permissions,
  rolePermissions,
  adminUsers,
  categories,
  brands,
  skinConcerns,
  products,
  productImages,
  productShades,
  users,
  addresses,
  discountCodes,
  orders,
  orderItems,
  paymentTransactions,
  productReviews,
  wishlistItems,
  returnRequests,
  announcements,
  newsletterSubscribers,
  quizResults,
  inventoryLogs,
} from './schema';

const now = new Date();
const past = (days: number) => new Date(Date.now() - days * 86_400_000);
const future = (days: number) => new Date(Date.now() + days * 86_400_000);

async function main() {
  console.log('Starting MAISON database seed...\n');

  // ── 1. Roles ──────────────────────────────────────────────────────────────
  console.log('1/21  Roles & permissions...');
  const roleIds = await db.insert(roles).values([
    { name: 'Super Admin',     slug: 'super-admin',     description: 'Full access to all modules', createdAt: now, updatedAt: now },
    { name: 'Product Manager', slug: 'product-manager', description: 'Manage products and inventory', createdAt: now, updatedAt: now },
    { name: 'Order Manager',   slug: 'order-manager',   description: 'Manage orders and returns', createdAt: now, updatedAt: now },
  ]).$returningId();

  const permIds = await db.insert(permissions).values([
    { name: 'View Products',  slug: 'products.view',   module: 'products',  createdAt: now, updatedAt: now },
    { name: 'Edit Products',  slug: 'products.edit',   module: 'products',  createdAt: now, updatedAt: now },
    { name: 'Delete Products',slug: 'products.delete', module: 'products',  createdAt: now, updatedAt: now },
    { name: 'View Orders',    slug: 'orders.view',     module: 'orders',    createdAt: now, updatedAt: now },
    { name: 'Edit Orders',    slug: 'orders.edit',     module: 'orders',    createdAt: now, updatedAt: now },
    { name: 'Cancel Orders',  slug: 'orders.cancel',   module: 'orders',    createdAt: now, updatedAt: now },
    { name: 'View Users',     slug: 'users.view',      module: 'users',     createdAt: now, updatedAt: now },
    { name: 'Edit Users',     slug: 'users.edit',      module: 'users',     createdAt: now, updatedAt: now },
    { name: 'View Analytics', slug: 'analytics.view',  module: 'analytics', createdAt: now, updatedAt: now },
  ]).$returningId();

  // Super Admin → all permissions
  await db.insert(rolePermissions).values(
    permIds.map(p => ({ roleId: roleIds[0].id, permissionId: p.id, createdAt: now }))
  );
  // Product Manager → products + analytics
  await db.insert(rolePermissions).values([
    { roleId: roleIds[1].id, permissionId: permIds[0].id, createdAt: now },
    { roleId: roleIds[1].id, permissionId: permIds[1].id, createdAt: now },
    { roleId: roleIds[1].id, permissionId: permIds[8].id, createdAt: now },
  ]);
  // Order Manager → orders
  await db.insert(rolePermissions).values([
    { roleId: roleIds[2].id, permissionId: permIds[3].id, createdAt: now },
    { roleId: roleIds[2].id, permissionId: permIds[4].id, createdAt: now },
    { roleId: roleIds[2].id, permissionId: permIds[5].id, createdAt: now },
  ]);
  console.log('      3 roles, 9 permissions');

  // ── 2. Admin Users ────────────────────────────────────────────────────────
  console.log('2/21  Admin users...');
  const adminPwd = await bcrypt.hash('admin123', 10);
  const adminIds = await db.insert(adminUsers).values([
    { roleId: roleIds[0].id, name: 'Maison Admin',    email: 'admin@maison.com',    password: adminPwd, phone: '9876543210', status: 'active', createdAt: now, updatedAt: now },
    { roleId: roleIds[1].id, name: 'Product Manager', email: 'products@maison.com', password: adminPwd, phone: '9876543211', status: 'active', createdAt: now, updatedAt: now },
  ]).$returningId();
  const adminId = adminIds[0].id;
  console.log('      admin@maison.com / admin123');

  // ── 3. Categories ─────────────────────────────────────────────────────────
  console.log('3/21  Categories...');
  await db.insert(categories).values([
    { name: 'Makeup',         slug: 'makeup',      displayOrder: 1,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Skincare',       slug: 'skincare',    displayOrder: 2,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Hair',           slug: 'hair',        displayOrder: 3,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Fragrance',      slug: 'fragrance',   displayOrder: 4,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Men',            slug: 'men',         displayOrder: 5,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Bath & Body',    slug: 'bath-body',   displayOrder: 6,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Wellness',       slug: 'wellness',    displayOrder: 7,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Gifts & Sets',   slug: 'gifts',       displayOrder: 8,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Tools & Brushes',slug: 'tools',       displayOrder: 9,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Minis & Travel', slug: 'minis',       displayOrder: 10, isActive: true, createdAt: now, updatedAt: now },
  ]);

  const allCats = await db.select().from(categories);
  const catBySlug: Record<string, number> = {};
  allCats.forEach(c => { catBySlug[c.slug] = c.id; });

  await db.insert(categories).values([
    { name: 'Lips',         slug: 'makeup-lips',             parentId: catBySlug['makeup'],   displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Eyes',         slug: 'makeup-eyes',             parentId: catBySlug['makeup'],   displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Face',         slug: 'makeup-face',             parentId: catBySlug['makeup'],   displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Nails',        slug: 'makeup-nails',            parentId: catBySlug['makeup'],   displayOrder: 4, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Serums',       slug: 'skincare-serums',         parentId: catBySlug['skincare'], displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Moisturisers', slug: 'skincare-moisturisers',   parentId: catBySlug['skincare'], displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Cleansers',    slug: 'skincare-cleansers',      parentId: catBySlug['skincare'], displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Toners',       slug: 'skincare-toners',         parentId: catBySlug['skincare'], displayOrder: 4, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Shampoo',      slug: 'hair-shampoo',            parentId: catBySlug['hair'],     displayOrder: 1, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Conditioner',  slug: 'hair-conditioner',        parentId: catBySlug['hair'],     displayOrder: 2, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Hair Masks',   slug: 'hair-masks',              parentId: catBySlug['hair'],     displayOrder: 3, isActive: true, createdAt: now, updatedAt: now },
  ]);

  const allCats2 = await db.select().from(categories);
  allCats2.forEach(c => { catBySlug[c.slug] = c.id; });
  console.log('      10 parent + 11 child categories');

  // ── 4. Brands ─────────────────────────────────────────────────────────────
  console.log('4/21  Brands...');
  await db.insert(brands).values([
    { name: 'Fenty Beauty',          slug: 'fenty-beauty',     tab: 'popular',  offerText: 'New Shades',          displayOrder: 1,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Charlotte Tilbury',     slug: 'charlotte-tilbury',tab: 'luxe',     offerText: 'Gift on ₹5000+',      displayOrder: 2,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'NARS',                  slug: 'nars',             tab: 'popular',  offerText: 'New Arrivals',         displayOrder: 3,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'MAC',                   slug: 'mac',              tab: 'popular',  offerText: 'Up to 20% Off',        displayOrder: 4,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Huda Beauty',           slug: 'huda-beauty',      tab: 'trending', offerText: 'New Collection',       displayOrder: 5,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Rare Beauty',           slug: 'rare-beauty',      tab: 'trending', offerText: 'Viral Picks',          displayOrder: 6,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Urban Decay',           slug: 'urban-decay',      tab: 'popular',  offerText: 'Up to 15% Off',        displayOrder: 7,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Too Faced',             slug: 'too-faced',        tab: 'popular',  offerText: 'Bundle Deals',         displayOrder: 8,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'Bobbi Brown',           slug: 'bobbi-brown',      tab: 'luxe',     offerText: 'Up to 10% Off',        displayOrder: 9,  isActive: true, createdAt: now, updatedAt: now },
    { name: 'NYX Professional Makeup', slug: 'nyx',            tab: 'popular',  offerText: 'Best Value',           displayOrder: 10, isActive: true, createdAt: now, updatedAt: now },
    { name: 'e.l.f. Cosmetics',      slug: 'elf',              tab: 'new',      offerText: 'Under ₹1500',          displayOrder: 11, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Drunk Elephant',        slug: 'drunk-elephant',   tab: 'luxe',     offerText: 'Bestsellers',          displayOrder: 12, isActive: true, createdAt: now, updatedAt: now },
    { name: 'The Ordinary',          slug: 'the-ordinary',     tab: 'popular',  offerText: 'Science-backed',       displayOrder: 13, isActive: true, createdAt: now, updatedAt: now },
    { name: 'La Roche-Posay',        slug: 'la-roche-posay',   tab: 'popular',  offerText: 'Derm Tested',          displayOrder: 14, isActive: true, createdAt: now, updatedAt: now },
    { name: 'CeraVe',                slug: 'cerave',           tab: 'popular',  offerText: 'Barrier Repair',       displayOrder: 15, isActive: true, createdAt: now, updatedAt: now },
    { name: 'La Mer',                slug: 'la-mer',           tab: 'luxe',     offerText: 'Up to 30% Off',        displayOrder: 16, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Dior Beauty',           slug: 'dior-beauty',      tab: 'luxe',     offerText: '3 gifts on ₹12k+',     displayOrder: 17, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Lancôme',               slug: 'lancome',          tab: 'luxe',     offerText: 'Up to 25% Off',        displayOrder: 18, isActive: true, createdAt: now, updatedAt: now },
    { name: 'Tom Ford',              slug: 'tom-ford',         tab: 'luxe',     offerText: 'Pouch on ₹8000',       displayOrder: 19, isActive: true, createdAt: now, updatedAt: now },
    { name: 'YSL Beauty',            slug: 'ysl-beauty',       tab: 'new',      offerText: 'New Collection',       displayOrder: 20, isActive: true, createdAt: now, updatedAt: now },
  ]);

  const allBrands = await db.select().from(brands);
  const brandByName: Record<string, number> = {};
  allBrands.forEach(b => { brandByName[b.name] = b.id; });
  console.log('      20 brands');

  // ── 5. Skin Concerns ──────────────────────────────────────────────────────
  console.log('5/21  Skin concerns...');
  await db.insert(skinConcerns).values([
    { icon: '●', label: 'Acne & Blemishes', slug: 'acne',        productCount: 12, isActive: true, displayOrder: 1, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Anti-Aging',       slug: 'anti-aging',  productCount: 18, isActive: true, displayOrder: 2, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Dark Spots',       slug: 'dark-spots',  productCount: 10, isActive: true, displayOrder: 3, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Dryness',          slug: 'dryness',     productCount: 15, isActive: true, displayOrder: 4, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Oiliness',         slug: 'oiliness',    productCount: 9,  isActive: true, displayOrder: 5, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Sensitivity',      slug: 'sensitivity', productCount: 11, isActive: true, displayOrder: 6, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Dark Circles',     slug: 'dark-circles',productCount: 7,  isActive: true, displayOrder: 7, createdAt: now, updatedAt: now },
    { icon: '●', label: 'Pores',            slug: 'pores',       productCount: 8,  isActive: true, displayOrder: 8, createdAt: now, updatedAt: now },
  ]);
  console.log('      8 skin concerns');

  // ── 6. Products ───────────────────────────────────────────────────────────
  console.log('6/21  Products...');

  type ProductSeed = {
    sku: string; name: string; slug: string; categorySlug: string; brandName: string;
    price: string; salePrice?: string; priceOffPercent?: number;
    stockQuantity: number; isFeatured?: boolean;
    badgeType?: 'new' | 'sale' | 'hot' | 'low'; badgeText?: string;
    bgColor?: string; image: string;
    description: string; shortDescription: string;
  };

  const productSeeds: ProductSeed[] = [
    // ── Makeup / Face ──────────────────────────────────────────────────────
    {
      sku: 'FB-PRO-001', name: "Pro Filt'r Soft Matte Foundation", slug: 'fenty-pro-filtr-foundation',
      categorySlug: 'makeup-face', brandName: 'Fenty Beauty',
      price: '3799.00', stockQuantity: 87, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80',
      description: 'A long-wearing, full-coverage matte foundation that minimises pores and controls shine for up to 24 hours. Available in 50 inclusive shades.',
      shortDescription: 'Full-coverage matte foundation, 50 shades',
    },
    {
      sku: 'RB-BLUSH-001', name: 'Soft Pinch Liquid Blush', slug: 'rare-beauty-soft-pinch-blush',
      categorySlug: 'makeup-face', brandName: 'Rare Beauty',
      price: '2599.00', stockQuantity: 156, isFeatured: true, badgeType: 'hot', badgeText: 'Viral',
      bgColor: '#1A0D10', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      description: 'A weightless liquid blush that blends effortlessly and stays put all day. A tiny amount gives a natural, buildable flush of colour.',
      shortDescription: 'Weightless liquid blush',
    },
    {
      sku: 'NARS-ORG-001', name: 'Orgasm Blush', slug: 'nars-orgasm-blush',
      categorySlug: 'makeup-face', brandName: 'NARS',
      price: '3299.00', stockQuantity: 92, isFeatured: true,
      bgColor: '#1A0D10', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      description: 'The iconic cult-favourite peachy-pink blush with golden shimmer that flatters every complexion.',
      shortDescription: 'Cult-favourite peachy-pink blush',
    },
    {
      sku: 'CT-FLAW-001', name: 'Flawless Filter Complexion Booster', slug: 'charlotte-tilbury-flawless-filter',
      categorySlug: 'makeup-face', brandName: 'Charlotte Tilbury',
      price: '4299.00', stockQuantity: 67, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80',
      description: 'A complexion booster that can be worn alone or mixed with foundation for an ethereal, lit-from-within glow. SPF 20 protection included.',
      shortDescription: 'Glow-enhancing complexion booster, SPF 20',
    },
    {
      sku: 'BB-FOUND-001', name: 'Skin Long-Wear Weightless Foundation SPF 15', slug: 'bobbi-brown-skin-longwear-foundation',
      categorySlug: 'makeup-face', brandName: 'Bobbi Brown',
      price: '4999.00', salePrice: '4549.00', priceOffPercent: 9, stockQuantity: 38, badgeType: 'sale', badgeText: '−9%',
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80',
      description: 'A weightless medium-to-full coverage foundation with SPF 15 that wears for 24 hours without budging.',
      shortDescription: 'Weightless 24-hour foundation SPF 15',
    },
    {
      sku: 'NARS-LAG-001', name: 'Laguna Bronzer', slug: 'nars-laguna-bronzer',
      categorySlug: 'makeup-face', brandName: 'NARS',
      price: '3799.00', stockQuantity: 61, isFeatured: true,
      bgColor: '#1A0D10', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      description: 'A sun-kissed bronzing powder that mimics the look of a natural tan. The silky formula blends seamlessly for a warm, luminous finish.',
      shortDescription: 'Natural sun-kissed bronzing powder',
    },
    {
      sku: 'ELF-HALO-001', name: 'Halo Glow Liquid Filter', slug: 'elf-halo-glow-liquid-filter',
      categorySlug: 'makeup-face', brandName: 'e.l.f. Cosmetics',
      price: '1299.00', stockQuantity: 178, badgeType: 'hot', badgeText: 'Hot',
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      description: 'A complexion-boosting liquid filter inspired by the Soft Focus Filter effect. Mix into foundation or wear alone for a radiant, glass-skin glow.',
      shortDescription: 'Glow-boosting complexion filter',
    },
    {
      sku: 'MAC-SF-001', name: 'Studio Fix Powder Plus Foundation', slug: 'mac-studio-fix-powder',
      categorySlug: 'makeup-face', brandName: 'MAC',
      price: '3299.00', stockQuantity: 74,
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&q=80',
      description: 'A two-in-one powder foundation that provides medium-to-full matte coverage. Minimises the appearance of pores and imperfections.',
      shortDescription: '2-in-1 powder foundation, matte finish',
    },
    {
      sku: 'MAC-FIX-001', name: 'Fix+ Setting Spray', slug: 'mac-fix-plus-setting-spray',
      categorySlug: 'makeup-face', brandName: 'MAC',
      price: '1999.00', stockQuantity: 113,
      bgColor: '#1A130A', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80',
      description: 'A lightweight hydrating spray that sets makeup and blends powder formulas into skin for a natural, seamless finish. Long-lasting all-day wear.',
      shortDescription: 'Setting & hydrating spray',
    },
    // ── Makeup / Lips ──────────────────────────────────────────────────────
    {
      sku: 'FB-GLOSS-001', name: 'Gloss Bomb Universal Lip Luminizer', slug: 'fenty-gloss-bomb',
      categorySlug: 'makeup-lips', brandName: 'Fenty Beauty',
      price: '2299.00', stockQuantity: 124, isFeatured: true, badgeType: 'hot', badgeText: 'Hot',
      bgColor: '#1A0A0A', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a6a?w=600&q=80',
      description: 'A non-sticky, high-shine lip gloss that gives a universally flattering sheen on all skin tones. Infused with shea butter for comfortable wear.',
      shortDescription: 'High-shine universal lip gloss',
    },
    {
      sku: 'CT-PILL-001', name: 'Pillow Talk Matte Revolution Lipstick', slug: 'charlotte-tilbury-pillow-lips',
      categorySlug: 'makeup-lips', brandName: 'Charlotte Tilbury',
      price: '3499.00', stockQuantity: 65, isFeatured: true, badgeType: 'new', badgeText: 'New',
      bgColor: '#1A0A0A', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a6a?w=600&q=80',
      description: 'The iconic Pillow Talk shade in a revolutionary matte formula that glides on like velvet without drying the lips. Long-lasting colour for 8 hours.',
      shortDescription: 'Iconic matte lipstick, 8-hour colour',
    },
    {
      sku: 'MAC-RUBY-001', name: 'Ruby Woo Retro Matte Lipstick', slug: 'mac-ruby-woo-lipstick',
      categorySlug: 'makeup-lips', brandName: 'MAC',
      price: '1799.00', stockQuantity: 210, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#1A0A0A', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a6a?w=600&q=80',
      description: "A classic vivid blue-red retro matte lipstick. One of MAC's all-time bestsellers that delivers full, opaque coverage in a single swipe.",
      shortDescription: 'Classic retro matte lipstick',
    },
    {
      sku: 'NARS-PWRM-001', name: 'Powermatte Lip Pigment', slug: 'nars-powermatte-lipstick',
      categorySlug: 'makeup-lips', brandName: 'NARS',
      price: '2899.00', salePrice: '2548.00', priceOffPercent: 12, stockQuantity: 43, badgeType: 'sale', badgeText: '−12%',
      bgColor: '#1A0A0A', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a6a?w=600&q=80',
      description: 'An ultra-saturated liquid lip colour with a comfortable matte finish that lasts up to 16 hours.',
      shortDescription: 'Ultra-saturated liquid matte lip colour',
    },
    {
      sku: 'HB-LC-001', name: 'Lip Contour 2.0 Lip Liner', slug: 'huda-beauty-lip-contour',
      categorySlug: 'makeup-lips', brandName: 'Huda Beauty',
      price: '1999.00', stockQuantity: 78, badgeType: 'new', badgeText: 'New',
      bgColor: '#1A0A0A', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a6a?w=600&q=80',
      description: 'A long-lasting creamy lip liner with a built-in sharpener that defines, fills and contours lips with precision.',
      shortDescription: 'Creamy long-lasting lip liner',
    },
    // ── Makeup / Eyes ──────────────────────────────────────────────────────
    {
      sku: 'UD-NAK-001', name: 'Naked3 Eyeshadow Palette', slug: 'urban-decay-naked-palette',
      categorySlug: 'makeup-eyes', brandName: 'Urban Decay',
      price: '5799.00', stockQuantity: 54, isFeatured: true, badgeType: 'hot', badgeText: 'Cult Fave',
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
      description: '12 rose-hued neutrals from shimmery to matte, perfect for a romantic smoky eye. Ultra-blendable formula for seamless colour payoff.',
      shortDescription: '12 rose neutrals eyeshadow palette',
    },
    {
      sku: 'HB-OBS-001', name: 'Obsessions Eyeshadow Palette – Rose Gold', slug: 'huda-beauty-obsessions-palette',
      categorySlug: 'makeup-eyes', brandName: 'Huda Beauty',
      price: '3999.00', stockQuantity: 71, badgeType: 'new', badgeText: 'New',
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
      description: '9 highly pigmented shadows in a stunning rose gold palette. Mix and match matte and shimmer shades for endless eye looks.',
      shortDescription: '9-shade rose gold eyeshadow palette',
    },
    {
      sku: 'TF-PEACH-001', name: 'Sweet Peach Eyeshadow Palette', slug: 'too-faced-sweet-peach-palette',
      categorySlug: 'makeup-eyes', brandName: 'Too Faced',
      price: '4499.00', salePrice: '3914.00', priceOffPercent: 13, stockQuantity: 29, badgeType: 'sale', badgeText: '−13%',
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
      description: '18 peachy-keen shades infused with real peach extract for a soft, blendable formula.',
      shortDescription: '18-shade peachy eyeshadow palette',
    },
    {
      sku: 'NYX-EIL-001', name: 'Epic Ink Liner', slug: 'nyx-epic-ink-liner',
      categorySlug: 'makeup-eyes', brandName: 'NYX Professional Makeup',
      price: '899.00', stockQuantity: 195, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
      description: 'A waterproof felt-tip liquid liner that delivers precise, bold lines. The super-fine tip makes it easy to create everything from thin lines to dramatic wings.',
      shortDescription: 'Waterproof felt-tip liquid liner',
    },
    {
      sku: 'UD-PERV-001', name: 'Perversion Mascara', slug: 'urban-decay-perversion-mascara',
      categorySlug: 'makeup-eyes', brandName: 'Urban Decay',
      price: '2299.00', stockQuantity: 88,
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
      description: 'A volumising mascara that delivers extreme fullness, supreme length and serious curl without flaking or smudging.',
      shortDescription: 'Volumising mascara, no flaking',
    },
    {
      sku: 'TF-BTS-001', name: 'Better Than Sex Mascara', slug: 'too-faced-better-than-sex-mascara',
      categorySlug: 'makeup-eyes', brandName: 'Too Faced',
      price: '2599.00', stockQuantity: 143, isFeatured: true, badgeType: 'hot', badgeText: 'Cult Fave',
      bgColor: '#0D0A1A', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
      description: 'The number one prestige mascara that gives dramatic volume, length and bold definition. The hourglass-shaped brush coats every lash from root to tip.',
      shortDescription: '#1 prestige volumising mascara',
    },
    // ── Skincare / Serums ──────────────────────────────────────────────────
    {
      sku: 'DE-CFIRM-001', name: 'C-Firma Fresh Day Serum', slug: 'drunk-elephant-c-firma-serum',
      categorySlug: 'skincare-serums', brandName: 'Drunk Elephant',
      price: '7999.00', stockQuantity: 35, isFeatured: true, badgeType: 'new', badgeText: 'New',
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      description: 'A potent vitamin C day serum that firms, brightens and improves signs of photoageing. Formulated with 15% L-ascorbic acid and antioxidants.',
      shortDescription: 'Vitamin C brightening day serum',
    },
    {
      sku: 'TO-NIAC-001', name: 'Niacinamide 10% + Zinc 1% Serum', slug: 'the-ordinary-niacinamide-serum',
      categorySlug: 'skincare-serums', brandName: 'The Ordinary',
      price: '699.00', stockQuantity: 312, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      description: 'A high-strength vitamin and mineral serum that reduces the appearance of blemishes, congestion and pore size.',
      shortDescription: 'High-strength niacinamide + zinc serum',
    },
    {
      sku: 'LRP-HYALU-001', name: 'Hyalu B5 Pure Hyaluronic Acid Serum', slug: 'la-roche-posay-hyalu-b5-serum',
      categorySlug: 'skincare-serums', brandName: 'La Roche-Posay',
      price: '3499.00', stockQuantity: 56,
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      description: 'A hydrating serum with two types of hyaluronic acid and vitamin B5 that visibly plumps and repairs the skin barrier.',
      shortDescription: 'Hyaluronic acid + B5 plumping serum',
    },
    // ── Skincare / Moisturisers ────────────────────────────────────────────
    {
      sku: 'DE-PROT-001', name: 'Protini Polypeptide Cream', slug: 'drunk-elephant-protini-moisturizer',
      categorySlug: 'skincare-moisturisers', brandName: 'Drunk Elephant',
      price: '8499.00', salePrice: '7819.00', priceOffPercent: 8, stockQuantity: 27, isFeatured: true, badgeType: 'sale', badgeText: '−8%',
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
      description: 'A protein-rich facial moisturiser that combines signal peptides, growth factors and amino acids for firmer, smoother and younger-looking skin.',
      shortDescription: 'Protein-rich anti-aging moisturiser',
    },
    {
      sku: 'CV-MOIST-001', name: 'Moisturising Cream', slug: 'cerave-moisturizing-cream',
      categorySlug: 'skincare-moisturisers', brandName: 'CeraVe',
      price: '1299.00', stockQuantity: 287, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
      description: 'A non-greasy moisturising cream with three essential ceramides and hyaluronic acid that hydrates and helps restore the protective skin barrier.',
      shortDescription: 'Ceramide-rich barrier moisturiser',
    },
    {
      sku: 'LRP-CICA-001', name: 'Cicaplast Baume B5+ Multi-Purpose Balm', slug: 'la-roche-posay-cicaplast-baume',
      categorySlug: 'skincare-moisturisers', brandName: 'La Roche-Posay',
      price: '1899.00', stockQuantity: 98,
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
      description: 'A soothing multi-purpose repairing balm for irritated, dry and damaged skin.',
      shortDescription: 'Multi-purpose soothing repair balm',
    },
    // ── Skincare / Cleansers ───────────────────────────────────────────────
    {
      sku: 'CV-FOAM-001', name: 'Foaming Facial Cleanser', slug: 'cerave-foaming-facial-cleanser',
      categorySlug: 'skincare-cleansers', brandName: 'CeraVe',
      price: '999.00', stockQuantity: 234, isFeatured: true, badgeType: 'hot', badgeText: 'Bestseller',
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80',
      description: 'A gentle foaming facial cleanser with niacinamide and ceramides that cleanses without stripping the skin.',
      shortDescription: 'Gentle niacinamide foaming cleanser',
    },
    {
      sku: 'LRP-EFFAC-001', name: 'Effaclar Purifying Foaming Gel', slug: 'la-roche-posay-effaclar-cleanser',
      categorySlug: 'skincare-cleansers', brandName: 'La Roche-Posay',
      price: '1199.00', stockQuantity: 145,
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80',
      description: 'A purifying foaming gel cleanser for oily and acne-prone skin that removes excess oil and unclogs pores.',
      shortDescription: 'Purifying gel cleanser, oily skin',
    },
    // ── Skincare / Toners ──────────────────────────────────────────────────
    {
      sku: 'TO-GLYC-001', name: 'Glycolic Acid 7% Toning Solution', slug: 'the-ordinary-glycolic-acid-toner',
      categorySlug: 'skincare-toners', brandName: 'The Ordinary',
      price: '899.00', stockQuantity: 189, isFeatured: true,
      bgColor: '#0A1A14', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      description: 'An exfoliating toning solution with glycolic acid and amino acids that improves skin radiance, texture and clarity over time.',
      shortDescription: 'Glycolic acid exfoliating toner',
    },
  ];

  await db.insert(products).values(
    productSeeds.map(p => ({
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      categoryId: catBySlug[p.categorySlug],
      brandId: brandByName[p.brandName],
      price: p.price,
      salePrice: p.salePrice ?? null,
      priceOffPercent: p.priceOffPercent ?? null,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: 10,
      taxRate: '18.00',
      isFeatured: p.isFeatured ?? false,
      isActive: true,
      badgeType: p.badgeType ?? null,
      badgeText: p.badgeText ?? null,
      bgColor: p.bgColor ?? null,
      description: p.description,
      shortDescription: p.shortDescription,
      createdAt: now,
      updatedAt: now,
    }))
  );

  const allProducts = await db.select().from(products);
  const prodBySlug: Record<string, number> = {};
  allProducts.forEach(p => { prodBySlug[p.slug] = p.id; });
  console.log(`      ${allProducts.length} products`);

  // ── 7. Product Images ─────────────────────────────────────────────────────
  console.log('7/21  Product images...');
  const imageRows = productSeeds.map(p => ({
    productId: prodBySlug[p.slug],
    imageUrl: p.image,
    thumbnailUrl: p.image.replace('w=600', 'w=200'),
    altText: p.name,
    displayOrder: 0,
    isPrimary: true,
    createdAt: now,
    updatedAt: now,
  })).filter(r => r.productId);

  await db.insert(productImages).values(imageRows);
  console.log(`      ${imageRows.length} product images`);

  // ── 8. Product Shades ─────────────────────────────────────────────────────
  console.log('8/21  Product shades...');
  const shadeNameMap = ['Warm Beige', 'Nude Rose', 'Warm Caramel', 'Deep Mocha', 'Espresso', 'Rich Ebony'];
  const shadeMap: Record<string, string[]> = {
    'fenty-pro-filtr-foundation':           ['#F5DEB3', '#DEB887', '#C4956A', '#8B6343', '#5C3A1E'],
    'fenty-gloss-bomb':                     ['#E8A0A0', '#C97B7B', '#D4607A', '#FF9EB5'],
    'charlotte-tilbury-pillow-lips':        ['#C97B8B', '#B5606E', '#9E4A5A'],
    'nars-powermatte-lipstick':             ['#8B0000', '#C41E3A', '#FF2052', '#FF69B4'],
    'huda-beauty-lip-contour':              ['#DEB887', '#C97B8B', '#B5606E', '#8B0000'],
    'rare-beauty-soft-pinch-blush':         ['#FF9EB5', '#FF6B81', '#E8A0A0', '#C97B7B'],
    'charlotte-tilbury-flawless-filter':    ['#F5DEB3', '#DEB887', '#C4956A', '#8B6343'],
    'bobbi-brown-skin-longwear-foundation': ['#F5DEB3', '#DEB887', '#C4956A', '#8B6343', '#5C3A1E', '#3B2010'],
    'urban-decay-naked-palette':            ['#E8C4A0', '#C8A080', '#A08060', '#806040', '#604020'],
    'huda-beauty-obsessions-palette':       ['#FFB6C1', '#FF69B4', '#C97B8B', '#B5606E'],
    'too-faced-sweet-peach-palette':        ['#FFDAB9', '#FFB347', '#FF8C69', '#E97451'],
    'elf-halo-glow-liquid-filter':          ['#F5DEB3', '#DEB887', '#C4956A'],
    'mac-studio-fix-powder':                ['#F5DEB3', '#DEB887', '#C4956A', '#8B6343'],
    'nars-orgasm-blush':                    ['#FF9EB5', '#FFB6A0'],
  };

  const shadeRows: {productId: number; shadeName: string; colorHex: string; displayOrder: number; isActive: boolean; createdAt: Date; updatedAt: Date}[] = [];
  for (const [slug, hexes] of Object.entries(shadeMap)) {
    const productId = prodBySlug[slug];
    if (!productId) continue;
    hexes.forEach((hex, idx) => {
      shadeRows.push({ productId, shadeName: shadeNameMap[idx] ?? `Shade ${idx + 1}`, colorHex: hex, displayOrder: idx, isActive: true, createdAt: now, updatedAt: now });
    });
  }
  await db.insert(productShades).values(shadeRows);
  console.log(`      ${shadeRows.length} product shades`);

  // ── 9. Users ──────────────────────────────────────────────────────────────
  console.log('9/21  Users...');
  const userPwd = await bcrypt.hash('user123', 10);
  await db.insert(users).values([
    { name: 'Priya Sharma',  email: 'priya@example.com',  password: userPwd, loyaltyTier: 'Gold',   loyaltyPoints: 1250, status: 'active', emailVerifiedAt: now, createdAt: past(180), updatedAt: now },
    { name: 'Sneha Patel',   email: 'sneha@example.com',  password: userPwd, loyaltyTier: 'Silver', loyaltyPoints: 620,  status: 'active', emailVerifiedAt: now, createdAt: past(120), updatedAt: now },
    { name: 'Ananya Reddy',  email: 'ananya@example.com', password: userPwd, loyaltyTier: 'Silver', loyaltyPoints: 480,  status: 'active', emailVerifiedAt: now, createdAt: past(90),  updatedAt: now },
    { name: 'Kavya Nair',    email: 'kavya@example.com',  password: userPwd, loyaltyTier: 'Bronze', loyaltyPoints: 120,  status: 'active', emailVerifiedAt: now, createdAt: past(60),  updatedAt: now },
    { name: 'Riya Mehta',    email: 'riya@example.com',   password: userPwd, loyaltyTier: 'Gold',   loyaltyPoints: 2340, status: 'active', emailVerifiedAt: now, createdAt: past(200), updatedAt: now },
    { name: 'Pooja Singh',   email: 'pooja@example.com',  password: userPwd, loyaltyTier: 'Bronze', loyaltyPoints: 80,   status: 'active', emailVerifiedAt: now, createdAt: past(45),  updatedAt: now },
    { name: 'Divya Iyer',    email: 'divya@example.com',  password: userPwd, loyaltyTier: 'Silver', loyaltyPoints: 390,  status: 'active', emailVerifiedAt: now, createdAt: past(75),  updatedAt: now },
    { name: 'Meera Joshi',   email: 'meera@example.com',  password: userPwd, loyaltyTier: 'Bronze', loyaltyPoints: 50,   status: 'active', emailVerifiedAt: now, createdAt: past(30),  updatedAt: now },
    { name: 'Tanya Gupta',   email: 'tanya@example.com',  password: userPwd, loyaltyTier: 'Bronze', loyaltyPoints: 200,  status: 'active', emailVerifiedAt: now, createdAt: past(55),  updatedAt: now },
    { name: 'Nisha Kapoor',  email: 'nisha@example.com',  password: userPwd, loyaltyTier: 'Bronze', loyaltyPoints: 30,   status: 'active', emailVerifiedAt: now, createdAt: past(20),  updatedAt: now },
  ] as any[]);

  const allUsers = await db.select().from(users);
  const userByEmail: Record<string, number> = {};
  allUsers.forEach(u => { userByEmail[u.email] = u.id; });
  console.log('      10 users (password: user123)');

  // ── 10. Addresses ─────────────────────────────────────────────────────────
  console.log('10/21 Addresses...');
  await db.insert(addresses).values([
    { userId: userByEmail['priya@example.com'],  fullName: 'Priya Sharma',  phone: '9810001001', addressLine1: '14, Pali Hill Road',         city: 'Mumbai',     state: 'Maharashtra',   pincode: '400050', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['sneha@example.com'],  fullName: 'Sneha Patel',   phone: '9820002002', addressLine1: '27B, Vasant Vihar',           city: 'New Delhi',  state: 'Delhi',         pincode: '110057', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['ananya@example.com'], fullName: 'Ananya Reddy',  phone: '9830003003', addressLine1: '5, Koramangala 4th Block',    city: 'Bangalore',  state: 'Karnataka',     pincode: '560034', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['kavya@example.com'],  fullName: 'Kavya Nair',    phone: '9840004004', addressLine1: '8, Jubilee Hills',            city: 'Hyderabad',  state: 'Telangana',     pincode: '500033', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['riya@example.com'],   fullName: 'Riya Mehta',    phone: '9850005005', addressLine1: '32, Alipore Road',            city: 'Kolkata',    state: 'West Bengal',   pincode: '700027', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['pooja@example.com'],  fullName: 'Pooja Singh',   phone: '9860006006', addressLine1: '11, Hazratganj',              city: 'Lucknow',    state: 'Uttar Pradesh', pincode: '226001', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['divya@example.com'],  fullName: 'Divya Iyer',    phone: '9870007007', addressLine1: '6, Nungambakkam High Road',   city: 'Chennai',    state: 'Tamil Nadu',    pincode: '600034', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['meera@example.com'],  fullName: 'Meera Joshi',   phone: '9880008008', addressLine1: '19, Camp',                    city: 'Pune',       state: 'Maharashtra',   pincode: '411001', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['tanya@example.com'],  fullName: 'Tanya Gupta',   phone: '9890009009', addressLine1: '3, Satellite',                city: 'Ahmedabad',  state: 'Gujarat',       pincode: '380015', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
    { userId: userByEmail['nisha@example.com'],  fullName: 'Nisha Kapoor',  phone: '9800010010', addressLine1: '22, Sector 17',               city: 'Chandigarh', state: 'Punjab',        pincode: '160017', country: 'India', addressType: 'both', isDefault: true, createdAt: now, updatedAt: now },
  ]);

  const allAddresses = await db.select().from(addresses);
  const addrByUserId: Record<number, typeof allAddresses[0]> = {};
  allAddresses.forEach(a => { if (a.userId) addrByUserId[a.userId] = a; });
  console.log('      10 addresses');

  // ── 11. Discount Codes ────────────────────────────────────────────────────
  console.log('11/21 Discount codes...');
  await db.insert(discountCodes).values([
    { code: 'WELCOME10', description: '10% off for new users',               discountType: 'percentage',   discountValue: '10.00', usageLimit: 500, usageLimitPerUser: 1, isActive: true, timesUsed: 0, validFrom: past(30),  validUntil: future(180), createdBy: adminId, createdAt: past(30), updatedAt: now },
    { code: 'FLAT500',   description: '₹500 flat off on orders above ₹2000', discountType: 'fixed_amount', discountValue: '500.00', minOrderValue: '2000.00', usageLimit: 200, isActive: true, timesUsed: 0, validFrom: past(30), validUntil: future(180), createdBy: adminId, createdAt: past(30), updatedAt: now },
    { code: 'BEAUTY20',  description: '20% off, max ₹1000 discount',         discountType: 'percentage',   discountValue: '20.00', maxDiscountAmount: '1000.00', usageLimit: 100, isActive: true, timesUsed: 0, validFrom: past(15), validUntil: future(90), createdBy: adminId, createdAt: past(15), updatedAt: now },
    { code: 'FIRST15',   description: '15% off your first order',            discountType: 'percentage',   discountValue: '15.00', usageLimit: 1000, usageLimitPerUser: 1, isActive: true, timesUsed: 0, validFrom: past(60), validUntil: future(300), createdBy: adminId, createdAt: past(60), updatedAt: now },
    { code: 'SUMMER25',  description: '25% off summer sale',                 discountType: 'percentage',   discountValue: '25.00', maxDiscountAmount: '1500.00', usageLimit: 300, isActive: true, timesUsed: 0, validFrom: past(5), validUntil: future(60), createdBy: adminId, createdAt: past(5), updatedAt: now },
  ] as any[]);

  const allDiscounts = await db.select().from(discountCodes);
  const discountByCode: Record<string, typeof allDiscounts[0]> = {};
  allDiscounts.forEach(d => { discountByCode[d.code] = d; });
  console.log('      5 discount codes');

  // ── 12 & 13. Orders + Order Items ─────────────────────────────────────────
  console.log('12/21 Orders & order items...');

  type OrderDef = {
    userEmail: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    paymentMethod: 'razorpay' | 'cod';
    items: { slug: string; qty: number }[];
    daysAgo: number;
    discountCode: string | null;
    tracking: string | null;
  };

  const orderDefs: OrderDef[] = [
    // Delivered
    { userEmail: 'priya@example.com',  status: 'delivered', paymentMethod: 'razorpay', items: [{ slug: 'fenty-pro-filtr-foundation', qty: 1 }, { slug: 'rare-beauty-soft-pinch-blush', qty: 1 }], daysAgo: 45, discountCode: null,        tracking: 'DTDC1234567' },
    { userEmail: 'priya@example.com',  status: 'delivered', paymentMethod: 'cod',      items: [{ slug: 'charlotte-tilbury-pillow-lips', qty: 2 }],                                                 daysAgo: 30, discountCode: 'WELCOME10',  tracking: 'BLDR7654321' },
    { userEmail: 'sneha@example.com',  status: 'delivered', paymentMethod: 'razorpay', items: [{ slug: 'the-ordinary-niacinamide-serum', qty: 2 }, { slug: 'cerave-moisturizing-cream', qty: 1 }],  daysAgo: 20, discountCode: 'FLAT500',    tracking: 'ECOM9876543' },
    { userEmail: 'ananya@example.com', status: 'delivered', paymentMethod: 'razorpay', items: [{ slug: 'too-faced-better-than-sex-mascara', qty: 1 }, { slug: 'nyx-epic-ink-liner', qty: 1 }],      daysAgo: 18, discountCode: null,        tracking: 'DTDC5678901' },
    { userEmail: 'kavya@example.com',  status: 'delivered', paymentMethod: 'cod',      items: [{ slug: 'cerave-foaming-facial-cleanser', qty: 1 }, { slug: 'la-roche-posay-cicaplast-baume', qty: 1 }], daysAgo: 15, discountCode: null,   tracking: 'XPRS3456789' },
    { userEmail: 'riya@example.com',   status: 'delivered', paymentMethod: 'razorpay', items: [{ slug: 'drunk-elephant-protini-moisturizer', qty: 1 }],                                              daysAgo: 12, discountCode: 'BEAUTY20',  tracking: 'ECOM1122334' },
    { userEmail: 'divya@example.com',  status: 'delivered', paymentMethod: 'razorpay', items: [{ slug: 'nars-orgasm-blush', qty: 1 }, { slug: 'nars-powermatte-lipstick', qty: 1 }],               daysAgo: 10, discountCode: null,        tracking: 'DTDC9988776' },
    { userEmail: 'meera@example.com',  status: 'delivered', paymentMethod: 'cod',      items: [{ slug: 'mac-ruby-woo-lipstick', qty: 1 }, { slug: 'elf-halo-glow-liquid-filter', qty: 1 }],         daysAgo: 8,  discountCode: null,        tracking: 'BLDR5544332' },
    // Shipped
    { userEmail: 'tanya@example.com',  status: 'shipped',   paymentMethod: 'razorpay', items: [{ slug: 'urban-decay-naked-palette', qty: 1 }],                                                       daysAgo: 3,  discountCode: 'FIRST15',   tracking: 'XPRS7766554' },
    { userEmail: 'nisha@example.com',  status: 'shipped',   paymentMethod: 'razorpay', items: [{ slug: 'huda-beauty-obsessions-palette', qty: 1 }, { slug: 'mac-fix-plus-setting-spray', qty: 1 }], daysAgo: 2,  discountCode: null,        tracking: 'ECOM3322110' },
    // Processing
    { userEmail: 'pooja@example.com',  status: 'processing',paymentMethod: 'razorpay', items: [{ slug: 'drunk-elephant-c-firma-serum', qty: 1 }],                                                    daysAgo: 1,  discountCode: null,        tracking: null },
    { userEmail: 'sneha@example.com',  status: 'processing',paymentMethod: 'cod',      items: [{ slug: 'la-roche-posay-hyalu-b5-serum', qty: 1 }, { slug: 'the-ordinary-glycolic-acid-toner', qty: 1 }], daysAgo: 1, discountCode: null,  tracking: null },
    // Confirmed
    { userEmail: 'ananya@example.com', status: 'confirmed', paymentMethod: 'razorpay', items: [{ slug: 'too-faced-sweet-peach-palette', qty: 1 }],                                                   daysAgo: 0,  discountCode: 'SUMMER25',  tracking: null },
    { userEmail: 'kavya@example.com',  status: 'confirmed', paymentMethod: 'cod',      items: [{ slug: 'nars-laguna-bronzer', qty: 1 }],                                                              daysAgo: 0,  discountCode: null,        tracking: null },
    // Pending
    { userEmail: 'riya@example.com',   status: 'pending',   paymentMethod: 'razorpay', items: [{ slug: 'charlotte-tilbury-flawless-filter', qty: 1 }],                                               daysAgo: 0,  discountCode: null,        tracking: null },
    { userEmail: 'priya@example.com',  status: 'pending',   paymentMethod: 'cod',      items: [{ slug: 'mac-studio-fix-powder', qty: 2 }],                                                            daysAgo: 0,  discountCode: null,        tracking: null },
    // Cancelled
    { userEmail: 'tanya@example.com',  status: 'cancelled', paymentMethod: 'razorpay', items: [{ slug: 'huda-beauty-lip-contour', qty: 1 }],                                                         daysAgo: 25, discountCode: null,        tracking: null },
    { userEmail: 'divya@example.com',  status: 'cancelled', paymentMethod: 'cod',      items: [{ slug: 'bobbi-brown-skin-longwear-foundation', qty: 1 }],                                            daysAgo: 40, discountCode: null,        tracking: null },
    // Refunded
    { userEmail: 'meera@example.com',  status: 'refunded',  paymentMethod: 'razorpay', items: [{ slug: 'cerave-moisturizing-cream', qty: 1 }],                                                       daysAgo: 60, discountCode: null,        tracking: null },
    { userEmail: 'nisha@example.com',  status: 'refunded',  paymentMethod: 'cod',      items: [{ slug: 'la-roche-posay-effaclar-cleanser', qty: 1 }],                                                daysAgo: 55, discountCode: null,        tracking: null },
  ];

  type CreatedOrder = { id: number; userId: number; status: string; paymentMethod: string; daysAgo: number; items: { productId: number; qty: number; price: number }[] };
  const createdOrders: CreatedOrder[] = [];
  let orderCounter = 1000;

  for (const def of orderDefs) {
    const userId = userByEmail[def.userEmail];
    const addr = addrByUserId[userId];
    if (!userId || !addr) continue;

    const itemDetails: { productId: number; qty: number; price: number }[] = [];
    let subtotal = 0;
    for (const item of def.items) {
      const prod = allProducts.find(p => p.slug === item.slug);
      if (!prod) continue;
      const price = parseFloat(String(prod.salePrice ?? prod.price));
      subtotal += price * item.qty;
      itemDetails.push({ productId: prod.id, qty: item.qty, price });
    }

    let discountAmount = 0;
    let discountCodeId: number | undefined;
    if (def.discountCode) {
      const disc = discountByCode[def.discountCode];
      if (disc) {
        discountCodeId = disc.id;
        if (disc.discountType === 'percentage') {
          discountAmount = subtotal * (parseFloat(String(disc.discountValue)) / 100);
          if (disc.maxDiscountAmount) discountAmount = Math.min(discountAmount, parseFloat(String(disc.maxDiscountAmount)));
        } else {
          discountAmount = parseFloat(String(disc.discountValue));
        }
      }
    }

    const taxable     = subtotal - discountAmount;
    const taxAmount   = taxable * 0.18;
    const shipping    = subtotal > 499 ? 0 : 49;
    const total       = taxable + taxAmount + shipping;
    const orderDate   = past(def.daysAgo);
    const orderNumber = `MSN${String(orderCounter++).padStart(6, '0')}`;

    const courierMap: Record<string, string> = { DTDC: 'DTDC', BLDR: 'Blue Dart', XPRS: 'Xpressbees', ECOM: 'Ecom Express' };
    const courierPrefix = def.tracking ? def.tracking.slice(0, 4) : '';
    const courierPartner = courierMap[courierPrefix] ?? undefined;

    const orderRow: any = {
      userId, orderNumber,
      status: def.status,
      paymentStatus: ['delivered', 'shipped'].includes(def.status) ? 'completed' : ['cancelled', 'refunded'].includes(def.status) ? 'refunded' : 'pending',
      paymentMethod: def.paymentMethod,
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      discountCodeId,
      taxAmount: taxAmount.toFixed(2),
      shippingAmount: shipping.toFixed(2),
      totalAmount: total.toFixed(2),
      shippingAddressId: addr.id,
      shippingFullName: addr.fullName, shippingPhone: addr.phone,
      shippingAddressLine1: addr.addressLine1, shippingAddressLine2: addr.addressLine2 ?? undefined,
      shippingCity: addr.city, shippingState: addr.state,
      shippingPincode: addr.pincode, shippingCountry: addr.country,
      billingAddressId: addr.id,
      billingFullName: addr.fullName, billingPhone: addr.phone,
      billingAddressLine1: addr.addressLine1, billingAddressLine2: addr.addressLine2 ?? undefined,
      billingCity: addr.city, billingState: addr.state,
      billingPincode: addr.pincode, billingCountry: addr.country,
      trackingNumber: def.tracking ?? undefined,
      courierPartner,
      shippedAt:   ['delivered', 'shipped'].includes(def.status) ? past(def.daysAgo > 3 ? def.daysAgo - 3 : 0) : undefined,
      deliveredAt: def.status === 'delivered' ? past(def.daysAgo > 7 ? def.daysAgo - 7 : 1) : undefined,
      cancelledAt: def.status === 'cancelled' ? past(def.daysAgo > 1 ? def.daysAgo - 1 : 0) : undefined,
      cancellationReason: def.status === 'cancelled' ? 'Customer requested cancellation' : undefined,
      createdAt: orderDate, updatedAt: orderDate,
    };

    const [{ id: orderId }] = await db.insert(orders).values(orderRow).$returningId();
    createdOrders.push({ id: orderId, userId, status: def.status, paymentMethod: def.paymentMethod, daysAgo: def.daysAgo, items: itemDetails });

    await db.insert(orderItems).values(
      itemDetails.map(item => {
        const prod = allProducts.find(p => p.id === item.productId)!;
        const sub = item.price * item.qty;
        const tax = sub * 0.18;
        return {
          orderId, productId: item.productId,
          productName: prod.name, productSku: prod.sku,
          quantity: item.qty,
          unitPrice: item.price.toFixed(2),
          taxRate: '18.00',
          taxAmount: tax.toFixed(2),
          subtotal: sub.toFixed(2),
          total: (sub + tax).toFixed(2),
          createdAt: orderDate, updatedAt: orderDate,
        };
      })
    );
  }
  console.log(`      ${createdOrders.length} orders with items`);

  // ── 14. Payment Transactions ──────────────────────────────────────────────
  console.log('14/21 Payment transactions...');
  const txnRows = createdOrders
    .filter(o => o.paymentMethod === 'razorpay')
    .map(o => ({
      orderId: o.id,
      paymentGateway: 'razorpay',
      transactionId: `pay_${Math.random().toString(36).substring(2, 18).toUpperCase()}`,
      paymentMethod: 'upi',
      amount: '0.00',
      currency: 'INR',
      status: ['delivered', 'shipped'].includes(o.status) ? 'success' : ['cancelled', 'refunded'].includes(o.status) ? 'refunded' : 'pending' as any,
      createdAt: past(o.daysAgo), updatedAt: past(o.daysAgo),
    }));
  if (txnRows.length) await db.insert(paymentTransactions).values(txnRows as any);
  console.log(`      ${txnRows.length} payment transactions`);

  // ── 15. Product Reviews ───────────────────────────────────────────────────
  console.log('15/21 Product reviews...');
  const reviewTexts = [
    'Absolutely love this product! The formula is incredible and long-lasting. My new holy grail.',
    'Great quality but slightly overpriced. Would definitely buy again when on sale.',
    'This is my holy grail product now. Everyone compliments me whenever I wear it.',
    'Decent product. Does exactly what it says on the tin — nothing more, nothing extraordinary.',
    'Amazing texture, blends so effortlessly into the skin. Worth every single rupee.',
    'Perfect for everyday use. Very pigmented and it stays put all day long.',
    'I was skeptical at first but this exceeded all my expectations completely!',
    'The packaging is gorgeous and the product quality is absolutely top notch.',
    'Good product overall. Had a slight reaction initially but it settled after a week.',
    'Best beauty purchase I have made in a long time. Highly recommend to everyone!',
  ];
  const reviewTitles = ['Love it!', 'Great product', 'Must-have', 'Highly recommend', 'Worth it', 'Amazing!', 'Good quality', 'Satisfied', 'Will reorder', 'Impressed!'];
  const reviewRatings = [5, 5, 4, 5, 4, 5, 4, 3, 5, 4];

  const deliveredOrders = createdOrders.filter(o => o.status === 'delivered');
  const reviewRows: any[] = [];
  deliveredOrders.forEach((order, oIdx) => {
    order.items.slice(0, 2).forEach((item, iIdx) => {
      reviewRows.push({
        productId: item.productId,
        userId: order.userId,
        orderId: order.id,
        rating: reviewRatings[(oIdx + iIdx) % reviewRatings.length],
        title: reviewTitles[(oIdx + iIdx) % reviewTitles.length],
        reviewText: reviewTexts[(oIdx + iIdx) % reviewTexts.length],
        status: 'approved',
        isVerifiedPurchase: true,
        helpfulCount: Math.floor(Math.random() * 30),
        approvedAt: past(order.daysAgo > 2 ? order.daysAgo - 2 : 1),
        approvedBy: adminId,
        createdAt: past(order.daysAgo > 3 ? order.daysAgo - 3 : 1),
        updatedAt: past(order.daysAgo > 2 ? order.daysAgo - 2 : 1),
      });
    });
  });
  if (reviewRows.length) await db.insert(productReviews).values(reviewRows);
  console.log(`      ${reviewRows.length} product reviews`);

  // ── 16. Wishlist Items ────────────────────────────────────────────────────
  console.log('16/21 Wishlist items...');
  const wishRows: { userId: number; productId: number; addedAt: Date }[] = [];
  const seen = new Set<string>();
  allUsers.forEach((user, uIdx) => {
    const start = (uIdx * 4) % allProducts.length;
    for (let i = 0; i < 4; i++) {
      const prod = allProducts[(start + i) % allProducts.length];
      const key = `${user.id}:${prod.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        wishRows.push({ userId: user.id, productId: prod.id, addedAt: past(Math.floor(Math.random() * 30) + 1) });
      }
    }
  });
  if (wishRows.length) await db.insert(wishlistItems).values(wishRows);
  console.log(`      ${wishRows.length} wishlist items`);

  // ── 17. Return Requests ───────────────────────────────────────────────────
  console.log('17/21 Return requests...');
  const d0 = deliveredOrders[0];
  const d1 = deliveredOrders[1];
  const d2 = deliveredOrders[2];
  await db.insert(returnRequests).values([
    {
      orderId: d0.id, userId: d0.userId, returnNumber: 'RTN-MSN-001',
      status: 'approved', reason: 'defective',
      reasonDetails: 'Product arrived with broken packaging and leakage.',
      refundMethod: 'original_payment', refundAmount: '3799.00',
      approvedBy: adminId, approvedAt: past(d0.daysAgo > 5 ? d0.daysAgo - 5 : 1),
      refundedAt: past(d0.daysAgo > 3 ? d0.daysAgo - 3 : 1),
      createdAt: past(d0.daysAgo), updatedAt: past(d0.daysAgo > 3 ? d0.daysAgo - 3 : 1),
    },
    {
      orderId: d1.id, userId: d1.userId, returnNumber: 'RTN-MSN-002',
      status: 'pending', reason: 'changed_mind',
      reasonDetails: 'I found a better shade elsewhere.',
      refundMethod: 'store_credit',
      createdAt: past(d1.daysAgo), updatedAt: past(d1.daysAgo),
    },
    {
      orderId: d2.id, userId: d2.userId, returnNumber: 'RTN-MSN-003',
      status: 'rejected', reason: 'not_as_described',
      reasonDetails: 'The shade is very different from what was shown online.',
      rejectedAt: past(d2.daysAgo > 1 ? d2.daysAgo - 1 : 1),
      rejectionReason: 'Return request submitted after the 7-day return window.',
      createdAt: past(d2.daysAgo), updatedAt: past(d2.daysAgo > 1 ? d2.daysAgo - 1 : 1),
    },
  ] as any[]);
  console.log('      3 return requests');

  // ── 18. Announcements ─────────────────────────────────────────────────────
  console.log('18/21 Announcements...');
  await db.insert(announcements).values([
    { text: 'Get ₹500 off on your first order — use code ', highlight: 'MAISON500', isActive: true, displayOrder: 0, startDate: past(30),  endDate: future(180), createdAt: past(30),  updatedAt: now },
    { text: 'Free delivery on orders over ₹499',             isActive: true, displayOrder: 1, startDate: past(60),  endDate: future(365), createdAt: past(60),  updatedAt: now },
    { text: 'New drops every Friday — follow us @maisonbeauty', isActive: true, displayOrder: 2, startDate: past(90), endDate: future(365), createdAt: past(90),  updatedAt: now },
    { text: 'Download the app for exclusive app-only deals',  isActive: true, displayOrder: 3, startDate: past(15),  endDate: future(365), createdAt: past(15),  updatedAt: now },
  ]);
  console.log('      4 announcements');

  // ── 19. Newsletter Subscribers ────────────────────────────────────────────
  console.log('19/21 Newsletter subscribers...');
  const newsletterEmails = [
    ...Object.keys(userByEmail),
    'beauty.lover@gmail.com', 'skincare.fan@gmail.com', 'makeup.addict@gmail.com',
    'glowup@hotmail.com', 'lipstick.queen@yahoo.com',
  ];
  await db.insert(newsletterSubscribers).values(
    newsletterEmails.map(email => ({
      email, isActive: true, source: 'homepage',
      subscribedAt: past(Math.floor(Math.random() * 60) + 1),
    }))
  );
  console.log(`      ${newsletterEmails.length} newsletter subscribers`);

  // ── 20. Quiz Results ──────────────────────────────────────────────────────
  console.log('20/21 Quiz results...');
  await db.insert(quizResults).values([
    { userId: userByEmail['priya@example.com'],  skinType: 'combination', primaryConcern: 'dark-spots',  undertone: 'warm',    completedAt: past(25), updatedAt: now },
    { userId: userByEmail['sneha@example.com'],  skinType: 'oily',        primaryConcern: 'acne',        undertone: 'neutral', completedAt: past(18), updatedAt: now },
    { userId: userByEmail['ananya@example.com'], skinType: 'dry',         primaryConcern: 'dryness',     undertone: 'cool',    completedAt: past(12), updatedAt: now },
    { userId: userByEmail['riya@example.com'],   skinType: 'normal',      primaryConcern: 'anti-aging',  undertone: 'warm',    completedAt: past(8),  updatedAt: now },
    { userId: userByEmail['divya@example.com'],  skinType: 'sensitive',   primaryConcern: 'sensitivity', undertone: 'cool',    completedAt: past(5),  updatedAt: now },
  ]);
  console.log('      5 quiz results');

  // ── 21. Inventory Logs ────────────────────────────────────────────────────
  console.log('21/21 Inventory logs...');
  await db.insert(inventoryLogs).values(
    allProducts.map(p => ({
      productId: p.id,
      adminUserId: adminId,
      changeType: 'purchase' as const,
      quantityBefore: 0,
      quantityChange: p.stockQuantity,
      quantityAfter: p.stockQuantity,
      referenceNumber: `PO-SEED-${p.sku}`,
      notes: 'Initial stock from seed',
      createdAt: past(90),
    }))
  );
  console.log(`      ${allProducts.length} inventory logs`);

  console.log('\nDatabase seeded successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:  admin@maison.com        / admin123');
  console.log('  User:   priya@example.com        / user123  (Gold tier, orders + reviews)');
  console.log('  User:   riya@example.com         / user123  (Gold tier)');
  console.log('  User:   sneha@example.com        / user123  (Silver tier)');
}

main()
  .catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
