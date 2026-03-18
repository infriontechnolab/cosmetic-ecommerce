# Cosmetics E-commerce — Sprint Task Board

**Client:** Jainam Patel / Infrion Technolab
**Stack:** Next.js 16 · TypeScript · Drizzle ORM · MySQL
**Total Budget:** ₹1,35,000

> Update task statuses as work progresses: `⬜ Pending` → `🚧 In Progress` → `✅ Done`

---

## Sprint 1 — Foundation & Core Setup (Weeks 1–2) · ₹20,000

| ID | Task | Status | Notes |
|---|---|---|---|
| S1-1 | Project setup | ✅ Done | Next.js 16, TypeScript, Tailwind v4, MySQL, Drizzle ORM, `.env.local.example` |
| S1-2 | User auth | ✅ Done | NextAuth.js v5 — credentials + Google OAuth, JWT sessions, proxy.ts, cart merge |
| S1-3 | Browse products | ✅ Done | Category + brand filter pages with sort & pagination; price sort bug fixed |
| S1-4 | Product management | ✅ Done | `/admin` panel: dashboard, product list (search/pagination), create/edit/delete forms, stock fields, ADMIN_EMAILS guard |
| S1-5 | Database design | ✅ Done | 20-table schema (v1.1), Drizzle schema.ts with all relations |
| S1-6 | Responsive design | ✅ Done | Mobile-first Tailwind components: Navbar, Hero, ProductCard, Footer, etc. |

---

## Sprint 2 — Shopping & Payment Flow (Weeks 3–5) · ₹30,000

| ID | Task | Status | Notes |
|---|---|---|---|
| S2-1 | Cart functionality | ✅ Done | `/api/cart` + session cookie + guest→user merge on login (`/api/cart/merge`) |
| S2-2 | Discount codes | ✅ Done | `/api/discounts/validate` — DB validation, per-user limits, min order, usage tracking |
| S2-3 | Checkout flow | ✅ Done | 4-step checkout: summary → delivery → payment → confirmed; real order in DB, GST calc, free shipping ≥₹999 |
| S2-4 | Razorpay + COD payments | ✅ Done | Razorpay Node SDK, create-order/verify/webhook APIs, COD option, HMAC-SHA256 signature verification |
| S2-5 | Order tracking | ✅ Done | `/account/orders` list + `/account/orders/[id]` detail with status timeline, tracking, cancellation modal |
| —   | Wishlist (bonus) | ✅ Done | `/api/wishlist` wired to `auth()` session — no more `x-user-id` header |

---

## Sprint 3 — Admin Panel & Analytics (Weeks 6–8) · ₹70,000

| ID | Task | Status | Notes |
|---|---|---|---|
| S3-1 | View all orders | ✅ Done | `/admin/orders` list (search/status filter/pagination/CSV export) + `/admin/orders/[id]` detail with status update, tracking entry, timeline |
| S3-2 | Inventory management | ✅ Done | `/admin/inventory` table with stock bars, low-stock/out-of-stock alerts; `/admin/inventory/[id]` adjust form with live preview + full history log |
| S3-3 | Returns & refunds | ✅ Done | Customer return form on order detail (delivered orders); admin `/admin/returns` list + `/admin/returns/[id]` approve→receive→refund workflow; Razorpay refund API for online payments |
| S3-4 | Sales analytics | ✅ Done | `/admin/analytics` — summary cards, revenue bar chart, top products + category bars, order status donut; 5 date presets (7d/30d/90d/month) |
| S3-5 | Role-based access | ⬜ Pending | `admin_users` + `roles` + `permissions` tables already in schema; build middleware |
| S3-6 | Banner/video management | ⬜ Pending | Upload banners/videos, display order toggle — `banners` + `videos` tables ready |

---

## Sprint 4 — Testing, Polish & Deployment (Weeks 9–11) · ₹15,000

| ID | Task | Status | Notes |
|---|---|---|---|
| S4-1 | Product reviews | ⬜ Pending | Star rating form, moderation queue, helpful votes — `product_reviews` table ready |
| S4-2 | Testing | ⬜ Pending | Unit (Vitest), integration (API routes), E2E (Playwright), performance (Lighthouse) |
| S4-3 | Email notifications | ⬜ Pending | Order confirm, shipping updates, welcome email — Resend + React Email templates |
| S4-4 | Production deployment | ⬜ Pending | Vercel deploy, custom domain + SSL, DB migration, environment variables |
| S4-5 | Documentation | ⬜ Pending | Admin guide, API docs (REST), deployment guide, env variable reference |

---

## Progress Summary

| Sprint | ✅ Done | 🚧 In Progress | ⬜ Pending | Total |
|---|---|---|---|---|
| Sprint 1 | 6 | 0 | 0 | 6 |
| Sprint 2 | 6 | 0 | 0 | 6 |
| Sprint 3 | 4 | 0 | 2 | 6 |
| Sprint 4 | 0 | 0 | 5 | 5 |
| **Total** | **16** | **0** | **7** | **23** |

---

## Next Immediate Task

**S3-5 — Role-Based Access**

- Wire `admin_users` + `roles` + `permissions` tables
- Replace `ADMIN_EMAILS` env var with DB-driven RBAC middleware

---

## Key Files Reference

| Area | File |
|---|---|
| DB schema (SQL) | `Downloads/cosmetics_ecommerce/cosmetics_ecommerce_schema.sql` |
| Drizzle schema | `src/db/schema.ts` |
| DB connection | `src/db/index.ts` |
| Products API | `src/app/api/products/route.ts` |
| Cart API | `src/app/api/cart/route.ts` |
| Wishlist API | `src/app/api/wishlist/route.ts` |
| DB queries | `src/db/queries/` |
| Data fetching lib | `src/lib/api.ts` |
| Frontend types | `src/types/product.ts`, `src/types/site.ts` |
