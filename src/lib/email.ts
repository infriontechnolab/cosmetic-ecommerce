import { Resend } from "resend";
import { getOrderForEmail, type OrderEmailData } from "@/db/queries/order-email";

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function buildOrderConfirmationHtml(order: OrderEmailData): string {
  const isOnline = order.paymentMethod === "razorpay";
  const hasDiscount = Number(order.discountAmount) > 0;
  const isFreeShipping = Number(order.shippingAmount) === 0;

  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#d4d4d4;">
          ${item.productName}
          <span style="display:block;font-size:12px;color:#737373;margin-top:2px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#d4d4d4;text-align:right;white-space:nowrap;">
          ${fmt(item.total)}
        </td>
      </tr>`
    )
    .join("");

  const address = [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    `${order.shippingCity}, ${order.shippingState} — ${order.shippingPincode}`,
  ]
    .filter(Boolean)
    .join("<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmed — MAISON</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#737373;">
                Luxury Beauty
              </p>
              <h1 style="margin:4px 0 0;font-size:28px;font-weight:900;color:#f5f5f5;letter-spacing:-0.03em;text-transform:uppercase;">
                MAISON
              </h1>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:#111;border:1px solid #1e1e1e;padding:36px 32px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(0,193,112,0.12);border:1px solid #00C170;margin:0 auto 20px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:22px;">✓</span>
              </div>
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f5f5f5;letter-spacing:-0.02em;text-transform:uppercase;">
                Order Confirmed
              </h2>
              <p style="margin:0;font-size:14px;color:#a3a3a3;">
                Thank you, <strong style="color:#f5f5f5;">${order.shippingFullName}</strong>.<br>
                Your order has been placed successfully.
              </p>
              <div style="margin:24px auto 0;display:inline-block;background:#0a0a0a;border:1px solid #2a2a2a;padding:12px 28px;">
                <p style="margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Order Number</p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#00C170;font-family:monospace;letter-spacing:0.04em;">
                  ${order.orderNumber}
                </p>
              </div>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0 0 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#737373;">
                Items Ordered
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding-top:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#737373;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#a3a3a3;text-align:right;padding:4px 0;">${fmt(order.subtotal)}</td>
                </tr>
                ${hasDiscount ? `
                <tr>
                  <td style="font-size:13px;color:#00C170;padding:4px 0;">Discount</td>
                  <td style="font-size:13px;color:#00C170;text-align:right;padding:4px 0;">−${fmt(order.discountAmount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size:13px;color:#737373;padding:4px 0;">GST (18%)</td>
                  <td style="font-size:13px;color:#a3a3a3;text-align:right;padding:4px 0;">${fmt(order.taxAmount)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#737373;padding:4px 0;">Shipping</td>
                  <td style="font-size:13px;${isFreeShipping ? "color:#00C170;" : "color:#a3a3a3;"}text-align:right;padding:4px 0;">
                    ${isFreeShipping ? "FREE" : fmt(order.shippingAmount)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:4px 0;"><div style="border-top:1px solid #1e1e1e;margin:8px 0;"></div></td>
                </tr>
                <tr>
                  <td style="font-size:16px;font-weight:700;color:#f5f5f5;padding:4px 0;">Total</td>
                  <td style="font-size:16px;font-weight:700;color:#f5f5f5;text-align:right;padding:4px 0;">${fmt(order.totalAmount)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Delivery info -->
          <tr>
            <td style="padding-top:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:12px;">
                    <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#737373;">
                      Delivering To
                    </p>
                    <p style="margin:0;font-size:13px;color:#a3a3a3;line-height:1.6;">
                      <strong style="color:#d4d4d4;">${order.shippingFullName}</strong><br>
                      ${address}<br>
                      ${order.shippingPhone}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:12px;">
                    <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#737373;">
                      Payment
                    </p>
                    <p style="margin:0;font-size:13px;color:#a3a3a3;line-height:1.6;">
                      ${isOnline ? "Online Payment<br><span style=\"color:#a3a3a3;\">Paid via Razorpay</span>" : "Cash on Delivery<br><span style=\"color:#a3a3a3;\">Pay when your order arrives</span>"}
                    </p>
                    <p style="margin:12px 0 0;font-size:13px;color:#a3a3a3;">
                      Expected delivery<br>
                      <strong style="color:#d4d4d4;">3–5 business days</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <a href="${process.env.AUTH_URL ?? "https://maison.store"}/account"
                style="display:inline-block;background:#00C170;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;padding:14px 32px;text-decoration:none;">
                Track My Order →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:40px;text-align:center;border-top:1px solid #1e1e1e;margin-top:32px;">
              <p style="margin:16px 0 4px;font-size:11px;color:#525252;">
                MAISON · Luxury Beauty
              </p>
              <p style="margin:0;font-size:11px;color:#404040;">
                Questions? Reply to this email or visit our
                <a href="${process.env.AUTH_URL ?? "https://maison.store"}/contact" style="color:#737373;">contact page</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(orderId: number): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }

  const order = await getOrderForEmail(orderId);
  if (!order) {
    console.error(`[email] Order ${orderId} not found for confirmation email`);
    return;
  }

  if (!order.userEmail) {
    console.warn(`[email] No email address for order ${orderId} — skipping`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "MAISON <orders@maison.store>";
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from,
      to: order.userEmail,
      subject: `Order Confirmed — ${order.orderNumber}`,
      html: buildOrderConfirmationHtml(order),
    });
  } catch (err) {
    // Log but never throw — email failure must not break the order flow
    console.error(`[email] Failed to send confirmation for order ${orderId}:`, err);
  }
}
