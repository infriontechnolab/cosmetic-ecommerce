'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

interface Shade { color: string }
interface ProductCardProps {
  id: string
  brand: string
  name: string
  rating: number
  reviews: string
  price: string
  priceWas?: string
  priceOff?: string
  badge?: { text: string; type: 'new' | 'sale' | 'hot' | 'low' }
  gwp?: string
  shades?: Shade[]
  image: string
  bgColor: string
}

const badgeCls = {
  new:  'bg-void-3 text-chalk border border-border-hi',
  sale: 'bg-red text-ivory',
  hot:  'bg-red text-ivory',
  low:  'bg-sage-light text-sage-dark',
}

export default function ProductCard({ id, brand, name, rating, reviews, price, priceWas, priceOff, badge, gwp, shades, image, bgColor }: ProductCardProps) {
  const [activeShade, setActiveShade] = useState(0)
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCart()
  const { isWished, toggleWish } = useWishlist()

  const wished = isWished(id)

  function handleAddToBag(e: React.MouseEvent) {
    e.stopPropagation()
    addItem({ id, brand, name, price, image, bgColor })
  }

  function handleWishToggle(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    toggleWish({ id, brand, name, rating, reviews, price, image, bgColor, shades, priceWas, priceOff, badge, gwp })
  }

  return (
    <div
      className="bg-surface border border-border overflow-hidden cursor-pointer transition-all relative"
      style={{ transform: hovered ? 'translateY(-3px)' : 'none', borderColor: hovered ? 'var(--color-terracotta)' : 'var(--color-border)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <Link href={`/products/${id}`}>
        <div className="relative overflow-hidden aspect-[1/1.1]" style={{ background: bgColor }}>
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-contain p-4 transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {badge && (
            <span className={`absolute top-[10px] left-[10px] z-[2] px-2 py-[3px] text-[10px] font-bold tracking-[0.06em] uppercase ${badgeCls[badge.type]}`}>
              {badge.text}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishToggle}
            className="absolute top-2 right-2 z-[3] w-8 h-8 bg-void/80 border border-border flex items-center justify-center hover:border-acid transition-all"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.8)', pointerEvents: hovered ? 'auto' : 'none' }}
          >
            <svg className={`w-[15px] h-[15px] transition-colors ${wished ? 'fill-acid stroke-acid' : 'fill-none stroke-chalk-2'}`} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>

          {/* GWP banner */}
          {gwp && (
            <div className="absolute bottom-0 left-0 right-0 z-[2] bg-void-3 border-t border-border text-acid px-[10px] py-[7px] text-[11px] font-semibold flex items-center gap-[5px]">
              <svg className="w-[11px] h-[11px] stroke-acid flex-shrink-0" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
              {gwp}
            </div>
          )}

          {/* Quick add */}
          <div
            className={`absolute left-0 right-0 z-[4] px-[10px] py-[10px] bg-deep-wine transition-all duration-300 ${gwp ? 'bottom-[34px]' : 'bottom-0'}`}
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(100%)', pointerEvents: hovered ? 'auto' : 'none' }}
          >
            {shades && (
              <div className="flex gap-[5px] mb-2 flex-wrap">
                {shades.map((sh, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveShade(i) }}
                    className={`w-[18px] h-[18px] border-2 cursor-pointer hover:scale-[1.2] transition-all ${activeShade === i ? 'border-acid scale-[1.2]' : 'border-transparent'}`}
                    style={{ background: sh.color }}
                  />
                ))}
              </div>
            )}
            <button
              onClick={handleAddToBag}
              className="w-full py-[10px] bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-[12px_14px_14px]">
        <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.08em]">{brand}</div>
        <div className="text-sm font-semibold text-chalk leading-[1.3] mt-1 font-display">{name}</div>
        <div className="flex items-center gap-[5px] mt-[6px]">
          <div className="flex items-center gap-[3px] bg-acid text-void px-[6px] py-[2px] text-[11px] font-bold">
            <svg className="w-[10px] h-[10px] fill-void" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {rating}
          </div>
          <span className="text-xs text-chalk-3">{reviews} reviews</span>
        </div>
        <div className="flex items-center gap-[7px] mt-2">
          <span className="text-[15px] font-semibold text-chalk">{price}</span>
          {priceWas && <span className="text-[13px] text-chalk-3 line-through">{priceWas}</span>}
          {priceOff && <span className="text-xs font-bold text-acid">{priceOff}</span>}
        </div>
        <div className="flex items-center gap-[5px] text-[11px] text-chalk-3 mt-[6px]">
          <svg className="w-[11px] h-[11px] stroke-chalk-3" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
          Free 30-day returns
        </div>
      </div>
    </div>
  )
}
