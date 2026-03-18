import { db } from "@/db";
import { orders, orderItems, products, discountCodes, discountUsage, carts, cartItems } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export type CreateOrderInput = {
  userId?: number;
  paymentMethod: "razorpay" | "cod";
  items: Array<{
    productSlug: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  shipping: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discountAmount: number;
  discountCodeId?: number;
  shippingAmount: number;
};

const TAX_RATE = 0.18;

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MAISON-${ts}-${rand}`;
}

export async function createOrder(input: CreateOrderInput): Promise<{
  orderId: number;
  orderNumber: string;
}> {
  const taxableAmount = input.subtotal - input.discountAmount;
  const taxAmount = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const totalAmount =
    Math.round((taxableAmount + taxAmount + input.shippingAmount) * 100) / 100;

  const orderNumber = generateOrderNumber();

  // Resolve product IDs from slugs
  const productRows = await Promise.all(
    input.items.map((item) =>
      db
        .select({ id: products.id, sku: products.sku, taxRate: products.taxRate })
        .from(products)
        .where(and(eq(products.slug, item.productSlug), isNull(products.deletedAt)))
        .limit(1)
        .then((rows) => ({ ...rows[0], slug: item.productSlug }))
    )
  );

  // Create order
  const orderValues = {
    userId: (input.userId ?? null) as unknown as number,
    orderNumber,
    paymentMethod: input.paymentMethod,
    subtotal: String(input.subtotal),
    discountAmount: String(input.discountAmount),
    discountCodeId: input.discountCodeId ?? null,
    taxAmount: String(taxAmount),
    shippingAmount: String(input.shippingAmount),
    totalAmount: String(totalAmount),
    shippingFullName: input.shipping.fullName,
    shippingPhone: input.shipping.phone,
    shippingAddressLine1: input.shipping.addressLine1,
    shippingAddressLine2: input.shipping.addressLine2 ?? null,
    shippingCity: input.shipping.city,
    shippingState: input.shipping.state,
    shippingPincode: input.shipping.pincode,
    billingFullName: input.shipping.fullName,
    billingPhone: input.shipping.phone,
    billingAddressLine1: input.shipping.addressLine1,
    billingAddressLine2: input.shipping.addressLine2 ?? null,
    billingCity: input.shipping.city,
    billingState: input.shipping.state,
    billingPincode: input.shipping.pincode,
    status: (input.paymentMethod === "cod" ? "confirmed" : "pending") as "confirmed" | "pending",
    paymentStatus: "pending" as const,
  };

  const [orderResult] = await db.insert(orders).values(orderValues);

  const orderId = Number(orderResult.insertId);

  // Create order items
  for (const item of input.items) {
    const product = productRows.find((p) => p.slug === item.productSlug);
    if (!product) continue;

    const taxRate = Number(product.taxRate ?? TAX_RATE * 100);
    const itemTax = Math.round(item.unitPrice * item.quantity * (taxRate / 100) * 100) / 100;
    const subtotal = Math.round(item.unitPrice * item.quantity * 100) / 100;

    await db.insert(orderItems).values({
      orderId,
      productId: product.id,
      productName: item.name,
      productSku: product.sku,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      taxRate: String(taxRate),
      taxAmount: String(itemTax),
      subtotal: String(subtotal),
      total: String(subtotal + itemTax),
    });
  }

  // Record discount usage
  if (input.discountCodeId && input.userId) {
    await db.insert(discountUsage).values({
      discountCodeId: input.discountCodeId,
      userId: input.userId,
      orderId,
      discountAmount: String(input.discountAmount),
    });

    // Increment timesUsed
    await db
      .update(discountCodes)
      .set({ timesUsed: db.$count(discountUsage, eq(discountUsage.discountCodeId, input.discountCodeId)) as unknown as number })
      .where(eq(discountCodes.id, input.discountCodeId));
  }

  // Clear DB cart for logged-in user
  if (input.userId) {
    const userSessionId = `user_${input.userId}`;
    const [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.sessionId, userSessionId))
      .limit(1);
    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }
  }

  return { orderId, orderNumber };
}
