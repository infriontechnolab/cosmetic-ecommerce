'use client'
import { useWishlist } from '@/context/WishlistContext'
import type { Product } from '@/types/product'

export default function WishlistButton({ product }: { product: Product }) {
  const { isWished, toggleWish } = useWishlist()
  const wished = isWished(product.id)

  return (
    <button
      onClick={() => toggleWish(product)}
      className={`flex-1 py-[14px] border text-sm font-bold transition-all uppercase tracking-[0.04em] ${
        wished
          ? 'border-acid bg-acid/10 text-acid'
          : 'border-border-hi text-chalk-2 hover:border-acid hover:text-acid'
      }`}
    >
      {wished ? '♥ WISHLISTED' : '♡ SAVE TO WISHLIST'}
    </button>
  )
}
