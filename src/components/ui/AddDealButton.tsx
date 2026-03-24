'use client'
import { useCart } from '@/context/CartContext'
import type { Deal } from '@/types/product'

export function AddDealButton({ deal }: { deal: Deal }) {
  const { addItem } = useCart()
  return (
    <button
      onClick={() => addItem({ id: deal.id, name: deal.name, brand: deal.brand, price: deal.price, image: deal.image, bgColor: deal.bgColor })}
      className="text-[11px] font-bold text-void bg-acid px-3 py-[5px] hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
    >
      Add
    </button>
  )
}
