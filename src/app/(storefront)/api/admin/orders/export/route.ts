import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrdersForCsv } from "@/db/queries/admin-orders";

function isAdmin(email: string | null | undefined) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "all";
  const rows = await getOrdersForCsv(status);

  const headers = [
    "Order Number",
    "Status",
    "Payment Status",
    "Payment Method",
    "Customer Name",
    "Customer Email",
    "Shipping Name",
    "Shipping Phone",
    "City",
    "State",
    "Pincode",
    "Subtotal",
    "Discount",
    "Tax",
    "Shipping",
    "Total",
    "Tracking Number",
    "Courier",
    "Date",
  ];

  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.orderNumber,
        r.status,
        r.paymentStatus,
        r.paymentMethod,
        r.customerName,
        r.customerEmail,
        r.shippingFullName,
        r.shippingPhone,
        r.shippingCity,
        r.shippingState,
        r.shippingPincode,
        r.subtotal,
        r.discountAmount ?? 0,
        r.taxAmount,
        r.shippingAmount ?? 0,
        r.totalAmount,
        r.trackingNumber,
        r.courierPartner,
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      ]
        .map(escape)
        .join(",")
    ),
  ].join("\r\n");

  return new NextResponse(lines, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${status}-${Date.now()}.csv"`,
    },
  });
}
