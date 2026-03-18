'use client'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types/product'

export default function AddToBagButton({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <button
      onClick={() => addItem({
        id: product.id,
        brand: product.brand,
        name: product.name,
        price: product.price,
        image: product.image,
        bgColor: product.bgColor,
      })}
      className="flex-1 py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
    >
      ADD TO BAG
    </button>
  )
}
