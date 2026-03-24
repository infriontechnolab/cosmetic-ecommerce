'use client'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import ProductCard from '@/components/ui/ProductCard'

export default function WishlistPage() {
  const { items, count } = useWishlist()

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Wishlist
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
              My <span className="text-acid">Wishlist</span>
            </h1>
            {count > 0 && <span className="text-chalk-3 text-sm">{count} item{count !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            </div>
            <h2 className="text-xl font-bold text-chalk font-display mb-2">Your wishlist is empty</h2>
            <p className="text-chalk-3 text-sm mb-6">Heart products you love to save them here</p>
            <Link href="/products" className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {items.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
