import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface OrderEmailData {
  orderNumber: string;
  paymentMethod: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  userEmail: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

export async function getOrderForEmail(
  orderId: number
): Promise<OrderEmailData | null> {
  const [order] = await db
    .select({
      orderNumber: orders.orderNumber,
      paymentMethod: orders.paymentMethod,
      subtotal: orders.subtotal,
      discountAmount: orders.discountAmount,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      totalAmount: orders.totalAmount,
      shippingFullName: orders.shippingFullName,
      shippingPhone: orders.shippingPhone,
      shippingAddressLine1: orders.shippingAddressLine1,
      shippingAddressLine2: orders.shippingAddressLine2,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingPincode: orders.shippingPincode,
      userId: orders.userId,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  // Get customer email via userId
  let userEmail: string | null = null;
  if (order.userId) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);
    userEmail = user?.email ?? null;
  }

  const items = await db
    .select({
      productName: orderItems.productName,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      total: orderItems.total,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount ?? "0.00",
    taxAmount: order.taxAmount,
    shippingAmount: order.shippingAmount ?? "0.00",
    totalAmount: order.totalAmount,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPincode: order.shippingPincode,
    userEmail,
    items: items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    })),
  };
}
