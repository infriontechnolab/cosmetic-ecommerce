'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types/product'

export default function ShadeAndBagClient({ product, selectedSize }: { product: Product; selectedSize?: string | null }) {
  const { addItem } = useCart()
  const [selectedShade, setSelectedShade] = useState<string | null>(
    product.shades && product.shades.length > 0 ? product.shades[0].color : null
  )

  const shades = product.shades ?? []

  function handleAddToBag() {
    addItem({
      id: product.id,
      brand: product.brand,
      name: product.name,
      price: product.price,
      image: product.image,
      bgColor: product.bgColor,
      shade: selectedShade ?? undefined,
      size: selectedSize ?? undefined,
    })
  }

  return (
    <>
      {shades.length > 0 && (
        <div className="mt-5 pb-5 border-b border-border">
          <div className="text-xs font-bold text-chalk-2 uppercase tracking-[0.08em] mb-3">
            Select Shade
            {selectedShade && (
              <span className="ml-2 font-normal text-chalk-3 normal-case tracking-normal">{selectedShade}</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {shades.map((sh, i) => (
              <button
                key={i}
                onClick={() => setSelectedShade(sh.color)}
                title={sh.color}
                className={`w-8 h-8 border-2 transition-all hover:scale-110 ${
                  selectedShade === sh.color ? 'border-acid scale-110' : 'border-transparent hover:border-acid'
                }`}
                style={{ background: sh.color }}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAddToBag}
        className="flex-1 py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] w-full"
      >
        ADD TO BAG
      </button>
    </>
  )
}
