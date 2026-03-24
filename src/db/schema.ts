import {
  mysqlTable,
  bigint,
  varchar,
  text,
  datetime,
  boolean,
  int,
  tinyint,
  decimal,
  mysqlEnum,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerifiedAt: datetime("email_verified_at"),
    password: varchar("password", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    phoneVerifiedAt: datetime("phone_verified_at"),
    status: mysqlEnum("status", ["active", "inactive", "blocked"]).notNull().default("active"),
    loyaltyPoints: int("loyalty_points", { unsigned: true }).notNull().default(0),
    loyaltyTier: mysqlEnum("loyalty_tier", ["Bronze", "Silver", "Gold", "Platinum"]).notNull().default("Bronze"),
    rememberToken: varchar("remember_token", { length: 100 }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_status").on(t.status), index("idx_loyalty_tier").on(t.loyaltyTier)]
);

export const addresses = mysqlTable(
  "addresses",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
    addressType: mysqlEnum("address_type", ["billing", "shipping", "both"]).notNull().default("both"),
    isDefault: boolean("is_default").default(false),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 10 }).notNull(),
    country: varchar("country", { length: 100 }).notNull().default("India"),
    landmark: varchar("landmark", { length: 255 }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_default").on(t.isDefault)]
);

// ============================================================================
// RBAC
// ============================================================================

export const roles = mysqlTable("roles", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
  deletedAt: datetime("deleted_at"),
});

export const permissions = mysqlTable("permissions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(),
  createdAt: datetime("created_at").default(new Date()),
  updatedAt: datetime("updated_at").default(new Date()),
  deletedAt: datetime("deleted_at"),
});

export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: bigint("permission_id", { mode: "number", unsigned: true }).notNull().references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: datetime("created_at").default(new Date()),
  },
  (t) => [unique("unique_role_permission").on(t.roleId, t.permissionId)]
);

export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    roleId: bigint("role_id", { mode: "number", unsigned: true }).notNull().references(() => roles.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
    lastLoginAt: datetime("last_login_at"),
    lastLoginIp: varchar("last_login_ip", { length: 45 }),
    rememberToken: varchar("remember_token", { length: 100 }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_role_id").on(t.roleId), index("idx_status").on(t.status)]
);

export const adminActivityLogs = mysqlTable(
  "admin_activity_logs",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    adminUserId: bigint("admin_user_id", { mode: "number", unsigned: true }).notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: bigint("entity_id", { mode: "number", unsigned: true }),
    description: text("description"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: text("metadata"), // JSON stored as text
    createdAt: datetime("created_at").default(new Date()),
  },
  (t) => [
    index("idx_admin_user_id").on(t.adminUserId),
    index("idx_action").on(t.action),
    index("idx_created_at").on(t.createdAt),
  ]
);

// ============================================================================
// PRODUCT CATALOG
// ============================================================================

export const brands = mysqlTable(
  "brands",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: varchar("logo_url", { length: 500 }),
    tab: mysqlEnum("tab", ["popular", "luxe", "new", "trending"]),
    offerText: varchar("offer_text", { length: 255 }),
    isActive: boolean("is_active").default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_is_active").on(t.isActive),
    index("idx_tab").on(t.tab),
    index("idx_display_order").on(t.displayOrder),
  ]
);

export const categories = mysqlTable(
  "categories",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    parentId: bigint("parent_id", { mode: "number", unsigned: true }).references((): any => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    icon: varchar("icon", { length: 10 }),
    displayOrder: int("display_order").notNull().default(0),
    isActive: boolean("is_active").default(true),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_parent_id").on(t.parentId),
    index("idx_is_active").on(t.isActive),
    index("idx_display_order").on(t.displayOrder),
  ]
);

export const products = mysqlTable(
  "products",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull().references(() => categories.id, { onDelete: "restrict" }),
    brandId: bigint("brand_id", { mode: "number", unsigned: true }).references(() => brands.id, { onDelete: "set null" }),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 500 }),
    ingredients: text("ingredients"),
    howToUse: text("how_to_use"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
    priceOffPercent: tinyint("price_off_percent", { unsigned: true }),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("18.00"),
    stockQuantity: int("stock_quantity", { unsigned: true }).notNull().default(0),
    lowStockThreshold: int("low_stock_threshold", { unsigned: true }).notNull().default(10),
    weight: decimal("weight", { precision: 8, scale: 2 }),
    dimensions: varchar("dimensions", { length: 50 }),
    bgColor: varchar("bg_color", { length: 7 }),
    badgeType: mysqlEnum("badge_type", ["new", "sale", "hot", "low"]),
    badgeText: varchar("badge_text", { length: 50 }),
    gwpText: varchar("gwp_text", { length: 100 }),
    isActive: boolean("is_active").default(true),
    isFeatured: boolean("is_featured").default(false),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: text("meta_description"),
    metaKeywords: text("meta_keywords"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_category_id").on(t.categoryId),
    index("idx_brand_id").on(t.brandId),
    index("idx_is_active").on(t.isActive),
    index("idx_is_featured").on(t.isFeatured),
    index("idx_badge_type").on(t.badgeType),
    index("idx_stock_quantity").on(t.stockQuantity),
    index("idx_price").on(t.price),
  ]
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    altText: varchar("alt_text", { length: 255 }),
    displayOrder: int("display_order").notNull().default(0),
    isPrimary: boolean("is_primary").default(false),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_product_id").on(t.productId),
    index("idx_is_primary").on(t.isPrimary),
  ]
);

export const productShades = mysqlTable(
  "product_shades",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    shadeName: varchar("shade_name", { length: 100 }).notNull(),
    colorHex: varchar("color_hex", { length: 7 }).notNull(),
    displayOrder: int("display_order").notNull().default(0),
    isActive: boolean("is_active").default(true),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_product_id").on(t.productId)]
);

export const productReviews = mysqlTable(
  "product_reviews",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
    orderId: bigint("order_id", { mode: "number", unsigned: true }),
    rating: tinyint("rating", { unsigned: true }).notNull(),
    title: varchar("title", { length: 255 }),
    reviewText: text("review_text"),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("pending"),
    isVerifiedPurchase: boolean("is_verified_purchase").default(false),
    helpfulCount: int("helpful_count", { unsigned: true }).default(0),
    notHelpfulCount: int("not_helpful_count", { unsigned: true }).default(0),
    adminResponse: text("admin_response"),
    approvedAt: datetime("approved_at"),
    approvedBy: bigint("approved_by", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_product_id").on(t.productId),
    index("idx_user_id").on(t.userId),
    index("idx_status").on(t.status),
    index("idx_rating").on(t.rating),
    unique("unique_user_product_order").on(t.userId, t.productId, t.orderId),
  ]
);

export const skinConcerns = mysqlTable(
  "skin_concerns",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    icon: varchar("icon", { length: 10 }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    productCount: int("product_count", { unsigned: true }).default(0),
    isActive: boolean("is_active").default(true),
    displayOrder: int("display_order").notNull().default(0),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_is_active").on(t.isActive), index("idx_display_order").on(t.displayOrder)]
);

// ============================================================================
// INVENTORY
// ============================================================================

export const inventoryLogs = mysqlTable(
  "inventory_logs",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    adminUserId: bigint("admin_user_id", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    orderId: bigint("order_id", { mode: "number", unsigned: true }),
    changeType: mysqlEnum("change_type", ["purchase", "sale", "return", "adjustment", "damage", "expired"]).notNull(),
    quantityBefore: int("quantity_before").notNull(),
    quantityChange: int("quantity_change").notNull(),
    quantityAfter: int("quantity_after").notNull(),
    referenceNumber: varchar("reference_number", { length: 100 }),
    notes: text("notes"),
    createdAt: datetime("created_at").default(new Date()),
  },
  (t) => [index("idx_product_id").on(t.productId), index("idx_change_type").on(t.changeType)]
);

// ============================================================================
// SHOPPING CART
// ============================================================================

export const carts = mysqlTable(
  "carts",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 255 }),
    expiresAt: datetime("expires_at"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_session_id").on(t.sessionId)]
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    cartId: bigint("cart_id", { mode: "number", unsigned: true }).notNull().references(() => carts.id, { onDelete: "cascade" }),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    quantity: int("quantity", { unsigned: true }).notNull().default(1),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    selectedShade: varchar("selected_shade", { length: 7 }),
    selectedSize: varchar("selected_size", { length: 50 }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [
    index("idx_cart_id").on(t.cartId),
    index("idx_product_id").on(t.productId),
    unique("unique_cart_product_variant").on(t.cartId, t.productId, t.selectedShade, t.selectedSize),
  ]
);

export const wishlistItems = mysqlTable(
  "wishlist_items",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "cascade" }),
    addedAt: datetime("added_at").default(new Date()),
  },
  (t) => [
    index("idx_user_id").on(t.userId),
    index("idx_product_id").on(t.productId),
    unique("unique_user_product").on(t.userId, t.productId),
  ]
);

// ============================================================================
// DISCOUNT & PROMOTION
// ============================================================================

export const discountCodes = mysqlTable(
  "discount_codes",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    description: text("description"),
    discountType: mysqlEnum("discount_type", ["percentage", "fixed_amount"]).notNull(),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
    maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
    usageLimit: int("usage_limit", { unsigned: true }),
    usageLimitPerUser: int("usage_limit_per_user", { unsigned: true }).default(1),
    timesUsed: int("times_used", { unsigned: true }).default(0),
    isActive: boolean("is_active").default(true),
    validFrom: datetime("valid_from").notNull(),
    validUntil: datetime("valid_until").notNull(),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_is_active").on(t.isActive)]
);

// ============================================================================
// ORDERS
// ============================================================================

export const orders = mysqlTable(
  "orders",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "restrict" }),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).notNull().default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "processing", "completed", "failed", "refunded"]).notNull().default("pending"),
    paymentMethod: mysqlEnum("payment_method", ["razorpay", "cod"]).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
    discountCodeId: bigint("discount_code_id", { mode: "number", unsigned: true }).references(() => discountCodes.id, { onDelete: "set null" }),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0.00"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    shippingAddressId: bigint("shipping_address_id", { mode: "number", unsigned: true }).references(() => addresses.id, { onDelete: "set null" }),
    shippingFullName: varchar("shipping_full_name", { length: 255 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 20 }).notNull(),
    shippingAddressLine1: varchar("shipping_address_line1", { length: 255 }).notNull(),
    shippingAddressLine2: varchar("shipping_address_line2", { length: 255 }),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingState: varchar("shipping_state", { length: 100 }).notNull(),
    shippingPincode: varchar("shipping_pincode", { length: 10 }).notNull(),
    shippingCountry: varchar("shipping_country", { length: 100 }).notNull().default("India"),
    billingAddressId: bigint("billing_address_id", { mode: "number", unsigned: true }).references(() => addresses.id, { onDelete: "set null" }),
    billingFullName: varchar("billing_full_name", { length: 255 }).notNull(),
    billingPhone: varchar("billing_phone", { length: 20 }).notNull(),
    billingAddressLine1: varchar("billing_address_line1", { length: 255 }).notNull(),
    billingAddressLine2: varchar("billing_address_line2", { length: 255 }),
    billingCity: varchar("billing_city", { length: 100 }).notNull(),
    billingState: varchar("billing_state", { length: 100 }).notNull(),
    billingPincode: varchar("billing_pincode", { length: 10 }).notNull(),
    billingCountry: varchar("billing_country", { length: 100 }).notNull().default("India"),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    courierPartner: varchar("courier_partner", { length: 100 }),
    shippedAt: datetime("shipped_at"),
    deliveredAt: datetime("delivered_at"),
    cancelledAt: datetime("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
    customerNotes: text("customer_notes"),
    adminNotes: text("admin_notes"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [
    index("idx_user_id").on(t.userId),
    index("idx_status").on(t.status),
    index("idx_payment_status").on(t.paymentStatus),
    index("idx_created_at").on(t.createdAt),
  ]
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    productId: bigint("product_id", { mode: "number", unsigned: true }).notNull().references(() => products.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 255 }).notNull(),
    productSku: varchar("product_sku", { length: 100 }).notNull(),
    quantity: int("quantity", { unsigned: true }).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_order_id").on(t.orderId), index("idx_product_id").on(t.productId)]
);

export const discountUsage = mysqlTable(
  "discount_usage",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    discountCodeId: bigint("discount_code_id", { mode: "number", unsigned: true }).notNull().references(() => discountCodes.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: datetime("created_at").default(new Date()),
  },
  (t) => [index("idx_discount_code_id").on(t.discountCodeId), index("idx_user_id").on(t.userId)]
);

// ============================================================================
// PAYMENT TRANSACTIONS
// ============================================================================

export const paymentTransactions = mysqlTable(
  "payment_transactions",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    paymentGateway: varchar("payment_gateway", { length: 50 }).notNull(),
    transactionId: varchar("transaction_id", { length: 255 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: mysqlEnum("status", ["pending", "processing", "success", "failed", "refunded"]).notNull().default("pending"),
    gatewayResponse: text("gateway_response"), // JSON stored as text
    errorCode: varchar("error_code", { length: 100 }),
    errorMessage: text("error_message"),
    refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
    refundedAt: datetime("refunded_at"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_order_id").on(t.orderId), index("idx_transaction_id").on(t.transactionId), index("idx_status").on(t.status)]
);

// ============================================================================
// RETURNS
// ============================================================================

export const returnRequests = mysqlTable(
  "return_requests",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
    returnNumber: varchar("return_number", { length: 50 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "received", "refunded"]).notNull().default("pending"),
    reason: mysqlEnum("reason", ["defective", "wrong_item", "not_as_described", "damaged", "changed_mind", "other"]).notNull(),
    reasonDetails: text("reason_details"),
    images: text("images"), // JSON stored as text
    refundMethod: mysqlEnum("refund_method", ["original_payment", "store_credit", "replacement"]),
    refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
    adminNotes: text("admin_notes"),
    approvedBy: bigint("approved_by", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    approvedAt: datetime("approved_at"),
    rejectedAt: datetime("rejected_at"),
    rejectionReason: text("rejection_reason"),
    receivedAt: datetime("received_at"),
    refundedAt: datetime("refunded_at"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_order_id").on(t.orderId), index("idx_user_id").on(t.userId), index("idx_status").on(t.status)]
);

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

export const announcements = mysqlTable(
  "announcements",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    text: text("text").notNull(),
    highlight: varchar("highlight", { length: 100 }),
    isActive: boolean("is_active").default(true),
    displayOrder: int("display_order").notNull().default(0),
    startDate: datetime("start_date"),
    endDate: datetime("end_date"),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_is_active").on(t.isActive), index("idx_display_order").on(t.displayOrder)]
);

export const banners = mysqlTable(
  "banners",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl: varchar("image_url", { length: 500 }).notNull(),
    mobileImageUrl: varchar("mobile_image_url", { length: 500 }),
    linkUrl: varchar("link_url", { length: 500 }),
    linkTarget: mysqlEnum("link_target", ["_self", "_blank"]).default("_self"),
    position: mysqlEnum("position", ["home_hero", "home_top", "home_middle", "home_bottom", "category_top", "product_sidebar"]).notNull(),
    displayOrder: int("display_order").notNull().default(0),
    isActive: boolean("is_active").default(true),
    startDate: datetime("start_date"),
    endDate: datetime("end_date"),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_position").on(t.position), index("idx_is_active").on(t.isActive)]
);

export const videos = mysqlTable(
  "videos",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: varchar("video_url", { length: 500 }).notNull(),
    thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
    videoType: mysqlEnum("video_type", ["youtube", "vimeo", "hosted"]).notNull().default("youtube"),
    youtubeVideoId: varchar("youtube_video_id", { length: 50 }),
    durationSeconds: int("duration_seconds", { unsigned: true }),
    position: mysqlEnum("position", ["home", "about", "product_page", "testimonials"]).notNull().default("home"),
    displayOrder: int("display_order").notNull().default(0),
    isActive: boolean("is_active").default(true),
    viewCount: int("view_count", { unsigned: true }).default(0),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
    deletedAt: datetime("deleted_at"),
  },
  (t) => [index("idx_position").on(t.position), index("idx_is_active").on(t.isActive)]
);

export const emailLogs = mysqlTable(
  "email_logs",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id, { onDelete: "set null" }),
    emailTo: varchar("email_to", { length: 255 }).notNull(),
    emailType: varchar("email_type", { length: 100 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    bodyHtml: text("body_html"),
    status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).notNull().default("pending"),
    errorMessage: text("error_message"),
    sentAt: datetime("sent_at"),
    openedAt: datetime("opened_at"),
    clickedAt: datetime("clicked_at"),
    metadata: text("metadata"), // JSON stored as text
    createdAt: datetime("created_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_user_id").on(t.userId), index("idx_email_type").on(t.emailType), index("idx_status").on(t.status)]
);

// ============================================================================
// NEWSLETTER
// ============================================================================

export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    isActive: boolean("is_active").default(true),
    source: varchar("source", { length: 50 }).default("homepage"),
    subscribedAt: datetime("subscribed_at").default(new Date()),
    unsubscribedAt: datetime("unsubscribed_at"),
  }
);

// ============================================================================
// QUIZ
// ============================================================================

export const quizResults = mysqlTable(
  "quiz_results",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    skinType: varchar("skin_type", { length: 50 }),
    primaryConcern: varchar("primary_concern", { length: 100 }),
    undertone: varchar("undertone", { length: 50 }),
    recommendedShades: text("recommended_shades"),
    recommendedProducts: text("recommended_products"),
    completedAt: datetime("completed_at").default(new Date()),
    updatedAt: datetime("updated_at").default(new Date()),
  },
  (t) => [index("idx_user_id").on(t.userId)]
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(productReviews),
  cartItems: many(carts),
  wishlistItems: many(wishlistItems),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  images: many(productImages),
  shades: many(productShades),
  reviews: many(productReviews),
  orderItems: many(orderItems),
  wishlistItems: many(wishlistItems),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  paymentTransactions: many(paymentTransactions),
  returnRequests: many(returnRequests),
  discountCode: one(discountCodes, { fields: [orders.discountCodeId], references: [discountCodes.id] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));
