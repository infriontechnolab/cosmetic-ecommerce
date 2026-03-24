'use client'
import { useState } from 'react'
import ShadeAndBagClient from '../ShadeAndBagClient'
import WishlistButton from '../WishlistButton'
import type { Product } from '@/types/product'

export default function SizeSelectorClient({ sizes, product }: { sizes: string[]; product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  return (
    <>
      <div className="mt-5 pb-5 border-b border-border">
        <div className="text-xs font-bold text-chalk-2 uppercase tracking-[0.08em] mb-3">Select Size</div>
        <div className="flex gap-2">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 border text-sm uppercase tracking-[0.04em] transition-all ${
                selectedSize === size
                  ? 'border-acid text-acid'
                  : 'border-border-hi text-chalk-2 hover:border-acid hover:text-acid'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <div className="flex-1 flex flex-col">
          <ShadeAndBagClient product={product} selectedSize={selectedSize} />
        </div>
        <WishlistButton product={product} />
      </div>
    </>
  )
}
