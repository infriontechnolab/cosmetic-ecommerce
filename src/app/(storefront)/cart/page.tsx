'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'

type PromoResult = { code: string; amount: number; message: string }

export default function CartPage() {
  const { items, count, removeItem, updateQty } = useCart()
  const [promo, setPromo] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null)

  const subtotal = items.reduce((sum, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0
    return sum + num * item.quantity
  }, 0)

  const discount = promoResult?.amount ?? 0
  const total = subtotal - discount

  async function applyPromo() {
    if (!promo.trim()) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo.trim(), subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoResult({ code: promo.trim().toUpperCase(), amount: data.amount, message: data.message })
      } else {
        setPromoError(data.error ?? 'Invalid promo code')
        setPromoResult(null)
      }
    } catch {
      setPromoError('Could not validate promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  function removePromo() {
    setPromoResult(null)
    setPromo('')
    setPromoError('')
  }

  return (
    <div className="bg-void min-h-screen">
      {/* Header */}
      <div className="bg-void-2 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-5">
          <h1 className="text-[28px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
            Your Bag <span className="text-chalk-3 text-[18px] font-bold">({count} {count === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Items col */}
        <div>
          {items.length === 0 ? (
            <div className="bg-surface border border-border p-12 text-center">
              <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/><path strokeLinecap="round" d="M16 10a4 4 0 01-8 0"/></svg>
              </div>
              <div className="text-lg font-bold text-chalk mb-2">Your bag is empty</div>
              <div className="text-sm text-chalk-3 mb-6">Add some products to get started</div>
              <Link href="/" className="inline-block px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {items.map(item => (
                <div key={item.lineKey} className="bg-surface border-b border-border p-5 flex gap-5 items-start">
                  {/* Image */}
                  <div className="w-[100px] h-[100px] border border-border flex-shrink-0 relative overflow-hidden" style={{ background: item.bgColor }}>
                    <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="100px" />
                  </div>
                  {/* Details */}
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.08em]">{item.brand}</div>
                    <div className="text-[15px] font-bold text-chalk mt-0.5 leading-[1.3]">{item.name}</div>
                    <div className="text-[15px] font-extrabold text-chalk mt-2">{item.price}</div>
                    {item.shade && <div className="text-xs text-chalk-3 mt-1">Shade: {item.shade}</div>}
                    {item.size && <div className="text-xs text-chalk-3">Size: {item.size}</div>}
                    <div className="flex items-center gap-4 mt-3">
                      {/* Qty control */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQty(item.lineKey, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-chalk-2 hover:bg-void-3 hover:text-acid transition-all text-lg font-bold"
                        >−</button>
                        <span className="w-10 text-center text-sm font-bold text-chalk">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.lineKey, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-chalk-2 hover:bg-void-3 hover:text-acid transition-all text-lg font-bold"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.lineKey)}
                        className="text-xs text-chalk-3 hover:text-red transition-colors uppercase tracking-[0.04em]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary col */}
        <div className="lg:sticky lg:top-[140px]">
          <div className="bg-surface border border-border p-6">
            <h2 className="text-[15px] font-extrabold text-chalk uppercase tracking-[0.06em] font-display mb-5 pb-5 border-b border-border">
              Order Summary
            </h2>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-chalk-2">
                <span>Subtotal ({count} items)</span>
                <span className="font-semibold text-chalk">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-chalk-2">
                <span>Shipping</span>
                <span className="font-bold text-acid">FREE</span>
              </div>
              {promoResult && (
                <div className="flex justify-between text-acid">
                  <span>Promo ({promoResult.code})</span>
                  <span className="font-bold">−₹{promoResult.amount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Promo input */}
            {promoResult ? (
              <div className="flex items-center justify-between mt-5 bg-acid/5 border border-acid/20 px-3 py-2">
                <span className="text-xs text-acid font-semibold">✓ {promoResult.code} applied</span>
                <button onClick={removePromo} className="text-xs text-chalk-3 hover:text-red-400 transition-colors uppercase tracking-[0.04em]">Remove</button>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promo}
                    onChange={e => { setPromo(e.target.value); setPromoError('') }}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    className="flex-1 px-3 py-[10px] bg-void border border-border text-sm text-chalk outline-none placeholder:text-chalk-3 focus:border-acid transition-all"
                  />
                  <button
                    onClick={applyPromo}
                    disabled={promoLoading || !promo.trim()}
                    className="px-4 py-[10px] border border-border text-xs font-bold text-chalk-2 hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {promoLoading ? '…' : 'Apply'}
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-400 mt-1.5">{promoError}</p>}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center mt-5 pt-5 border-t border-border">
              <span className="text-[15px] font-extrabold text-chalk uppercase tracking-[0.04em]">Total</span>
              <span className="text-[22px] font-extrabold text-chalk">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <Link
              href="/checkout"
              className={`block w-full mt-5 py-[14px] bg-acid text-void text-sm font-bold text-center hover:bg-acid-dim transition-colors uppercase tracking-[0.06em] ${items.length === 0 ? 'pointer-events-none opacity-40' : ''}`}
            >
              CHECKOUT →
            </Link>

            <Link href="/" className="block text-center text-xs text-chalk-3 hover:text-acid transition-colors mt-4 uppercase tracking-[0.04em]">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
