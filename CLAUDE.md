# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Build & Production
npm run build        # Build for production
npm run start        # Run production server

# Linting
npm run lint         # Run ESLint

# Database (Drizzle ORM)
npm run db:push      # Push schema changes directly to DB (dev)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio (visual DB browser)
npm run db:pull      # Pull schema from existing DB
```

## Architecture

Full-stack luxury beauty e-commerce app (MAISON) built with Next.js 16 App Router, MySQL (Drizzle ORM), NextAuth v5, Razorpay, and shadcn/ui.

### Route Structure

Two main routing segments:
- `src/app/(storefront)/` — Customer-facing pages and API routes
- `src/app/admin/` — Admin dashboard (product/order/inventory/returns/analytics management)

API routes live under `src/app/(storefront)/api/` and follow RESTful conventions organized by domain (auth, products, cart, orders, payments, wishlist, reviews, addresses, profile, returns, discounts, admin).

### Database Layer

- **ORM**: Drizzle ORM with MySQL2 driver (connection pool of 10)
- **Schema**: `src/db/schema.ts` — single 700+ line file defining all tables (users, products, variants, orders, payments, cart, wishlist, reviews, returns, coupons, loyalty points, admin audit logs)
- **Queries**: `src/db/queries/` — domain-separated query files (`admin-products.ts`, `cart.ts`, `orders.ts`, etc.)
- **Instance**: `src/db/index.ts` exports the single `db` instance

When modifying the schema, run `db:push` for dev or `db:generate` + `db:migrate` for production migrations.

### Authentication

- NextAuth v5 (`auth.ts`) with JWT session strategy
- Credentials provider (email/password via bcryptjs) + optional Google OAuth
- Admin access: `requireAdmin()` checks session email against `ADMIN_EMAILS` env var (comma-separated)
- Session available via `auth()` server-side or `useSession()` client-side

### State Management

- **Cart**: `src/context/CartContext.tsx` — localStorage-based, works without login
- **Wishlist**: `src/context/WishlistContext.tsx` — localStorage for guests, syncs to API for authenticated users
- All providers wrapped in `src/app/providers.tsx`

### Component Organization

- `src/components/ui/` — shadcn/ui primitives
- `src/components/layout/` — Navbar, Footer, AnnouncementBar
- `src/components/sections/` — Home page sections
- `src/components/admin/` — Admin-specific UI components

### Key Patterns

- Default to Server Components; add `'use client'` only for interactivity
- Server actions in `src/lib/admin-actions.ts` for admin mutations
- Path alias `@/*` maps to `src/*`
- Tailwind CSS v4 with custom theme tokens defined in `src/app/globals.css` (not `tailwind.config.ts`)
- Dynamic product routes: `/products/[slug]` with `_components/` subdirectory for co-located components

## Environment Variables

See `.env.local.example` for the full list. Required variables:

```env
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME   # MySQL connection
AUTH_SECRET                                         # NextAuth secret (min 32 chars)
AUTH_URL                                            # App base URL
ADMIN_EMAILS                                        # Comma-separated admin emails
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET               # Payment processing
RAZORPAY_WEBHOOK_SECRET                             # Webhook verification
NEXT_PUBLIC_RAZORPAY_KEY_ID                        # Client-side Razorpay key
```

Optional: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`
