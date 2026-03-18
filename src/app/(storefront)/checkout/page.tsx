'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'

// Razorpay checkout.js global type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open(): void }
  }
}

type Step = 'summary' | 'delivery' | 'payment' | 'confirmed'

interface DeliveryForm {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
}

const EMPTY_FORM: DeliveryForm = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', pincode: '',
}

type PayMethod = 'upi' | 'card' | 'cod'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parsePrice = (p: string) => parseFloat(p.replace(/[₹,\s]/g, '')) || 0

const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'summary', label: 'Order Summary' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmed', label: 'Confirmed' },
  ]
  const idx = steps.findIndex(s => s.key === current)
  return (
    <div className="flex items-center gap-0 mb-8 flex-wrap">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-[10px] text-xs font-bold uppercase tracking-[0.06em] border transition-all ${
            i < idx ? 'border-acid/30 text-chalk-3 bg-[rgba(204,255,0,.04)]'
            : i === idx ? 'border-acid text-acid bg-[rgba(204,255,0,.08)]'
            : 'border-border text-chalk-3'
          }`}>
            <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border ${
              i < idx ? 'border-acid/50 text-acid bg-[rgba(204,255,0,.1)]'
              : i === idx ? 'border-acid text-void bg-acid'
              : 'border-border text-chalk-3'
            }`}>{i < idx ? '✓' : i + 1}</span>
            {s.label}
          </div>
          {i < steps.length - 1 && <div className={`w-8 h-px ${i < idx ? 'bg-acid/30' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, count, clearCart } = useCart()
  const { data: session } = useSession()

  const [step, setStep] = useState<Step>('summary')
  const [delivery, setDelivery] = useState<DeliveryForm>({
    ...EMPTY_FORM,
    fullName: session?.user?.name ?? '',
  })
  const [payMethod, setPayMethod] = useState<PayMethod>('cod')

  // Promo state
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoData, setPromoData] = useState<{
    code: string; discountId: number; amount: number; message: string
  } | null>(null)

  // Order state
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState<{ number: string; shipping: number } | null>(null)

  // Load Razorpay checkout.js
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0)
  const discountAmount = promoData?.amount ?? 0
  const taxableAmount = subtotal - discountAmount
  const shippingAmount = taxableAmount >= 999 ? 0 : 99
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100
  const total = taxableAmount + taxAmount + shippingAmount

  const allFieldsFilled = (
    delivery.fullName.trim() &&
    delivery.phone.trim() &&
    delivery.addressLine1.trim() &&
    delivery.city.trim() &&
    delivery.state.trim() &&
    delivery.pincode.trim()
  )

  // ─── Apply promo ───────────────────────────────────────────────────────────
  async function applyPromo() {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoData(null)
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoData({ code: promoInput.trim().toUpperCase(), discountId: data.discountId, amount: data.amount, message: data.message })
      } else {
        setPromoError(data.error ?? 'Invalid code.')
      }
    } catch {
      setPromoError('Could not validate code. Try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  // ─── Place order ───────────────────────────────────────────────────────────
  async function placeOrder() {
    setPlacing(true)
    setPlaceError('')

    const orderPayload = {
      items: items.map(i => ({
        productSlug: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: parsePrice(i.price),
      })),
      shipping: {
        fullName: delivery.fullName,
        phone: delivery.phone,
        addressLine1: delivery.addressLine1,
        addressLine2: delivery.addressLine2 || undefined,
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode,
      },
      paymentMethod: payMethod === 'cod' ? 'cod' : 'razorpay',
      discountAmount: promoData?.amount,
      discountCodeId: promoData?.discountId,
    }

    try {
      // Step 1: Create order in DB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        setPlaceError(orderData.error ?? 'Failed to place order.')
        setPlacing(false)
        return
      }

      // COD: done
      if (payMethod === 'cod') {
        clearCart()
        setConfirmedOrder({ number: orderData.orderNumber, shipping: orderData.shippingAmount })
        setStep('confirmed')
        setPlacing(false)
        return
      }

      // Razorpay: Step 2 — create Razorpay order
      const rzpRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.orderId, amount: total }),
      })
      const rzpData = await rzpRes.json()
      if (!rzpRes.ok) {
        setPlaceError(rzpData.error ?? 'Payment setup failed.')
        setPlacing(false)
        return
      }

      // Step 3: Open Razorpay modal
      setPlacing(false)
      const rzp = new window.Razorpay({
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'MAISON',
        description: `Order ${orderData.orderNumber}`,
        order_id: rzpData.razorpayOrderId,
        prefill: rzpData.prefill,
        theme: { color: '#ccff00' },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // Step 4: Verify on server
          setPlacing(true)
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          setPlacing(false)
          if (verifyRes.ok) {
            clearCart()
            setConfirmedOrder({ number: orderData.orderNumber, shipping: orderData.shippingAmount })
            setStep('confirmed')
          } else {
            setPlaceError('Payment verification failed. Contact support with order ' + orderData.orderNumber)
          }
        },
        modal: {
          ondismiss: () => {
            setPlaceError('Payment cancelled. Your order is saved — try again.')
          },
        },
      })
      rzp.open()
    } catch {
      setPlaceError('Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  // ─── Field helper ──────────────────────────────────────────────────────────
  const field = (key: keyof DeliveryForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDelivery(prev => ({ ...prev, [key]: e.target.value }))

  // ─── Empty cart guard ──────────────────────────────────────────────────────
  if (items.length === 0 && step !== 'confirmed') {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🛍️</div>
        <h2 className="text-xl font-bold text-chalk font-display">Your bag is empty</h2>
        <Link href="/products" className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
          Start Shopping
        </Link>
      </div>
    )
  }

  // ─── Order summary sidebar ─────────────────────────────────────────────────
  function OrderSidebar({ action }: { action: React.ReactNode }) {
    return (
      <div className="bg-surface border border-border p-6 h-fit sticky top-[120px]">
        <h3 className="text-sm font-bold text-chalk uppercase tracking-[0.06em] mb-4">Order Summary</h3>
        <div className="flex flex-col gap-2.5 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-chalk-3">Subtotal ({count} items)</span>
            <span className="text-chalk font-semibold">{fmt(subtotal)}</span>
          </div>
          {promoData && (
            <div className="flex justify-between text-acid">
              <span>Promo ({promoData.code})</span>
              <span>−{fmt(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-chalk-3">GST (18%)</span>
            <span className="text-chalk">{fmt(taxAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-chalk-3">Shipping</span>
            {shippingAmount === 0
              ? <span className="text-acid font-semibold text-xs">FREE</span>
              : <span className="text-chalk">{fmt(shippingAmount)}</span>
            }
          </div>
        </div>
        <div className="border-t border-border pt-4 mb-5">
          <div className="flex justify-between text-base font-extrabold text-chalk">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          {shippingAmount > 0 && (
            <p className="text-xs text-chalk-3 mt-1">
              Add {fmt(999 - (subtotal - discountAmount))} more for free shipping
            </p>
          )}
        </div>
        {action}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link> /{' '}
            <Link href="/cart" className="hover:text-acid transition-colors">Cart</Link> / Checkout
          </div>
          <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">Checkout</h1>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 1: SUMMARY ── */}
        {step === 'summary' && (
          <div className="grid grid-cols-[1fr_380px] gap-8">
            <div>
              <h2 className="text-lg font-bold text-chalk mb-4 font-display">Your Bag ({count} items)</h2>
              <div className="flex flex-col gap-3">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 bg-surface border border-border p-4">
                    <div className="w-16 h-16 flex-shrink-0 relative rounded overflow-hidden" style={{ background: item.bgColor }}>
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.08em]">{item.brand}</div>
                      <div className="text-sm font-semibold text-chalk mt-0.5">{item.name}</div>
                      {item.shade && <div className="text-xs text-chalk-3 mt-0.5">Shade: {item.shade}</div>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-chalk-3">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-chalk">{fmt(parsePrice(item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mt-6 bg-surface border border-border p-5">
                <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                    placeholder="Enter code"
                    disabled={!!promoData}
                    className={`flex-1 ${inputCls} disabled:opacity-50`}
                  />
                  {promoData ? (
                    <button
                      onClick={() => { setPromoData(null); setPromoInput('') }}
                      className="px-4 py-[10px] border border-border text-chalk-3 text-xs font-semibold hover:border-red-400 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-[10px] bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors disabled:opacity-50"
                    >
                      {promoLoading ? '…' : 'Apply'}
                    </button>
                  )}
                </div>
                {promoError && <p className="text-xs text-red-400 mt-2">{promoError}</p>}
                {promoData && <p className="text-xs text-acid mt-2">✓ {promoData.message}</p>}
              </div>
            </div>

            <OrderSidebar
              action={
                <button
                  onClick={() => setStep('delivery')}
                  className="w-full py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
                >
                  Continue to Delivery →
                </button>
              }
            />
          </div>
        )}

        {/* ── STEP 2: DELIVERY ── */}
        {step === 'delivery' && (
          <div className="grid grid-cols-[1fr_380px] gap-8">
            <div>
              <h2 className="text-lg font-bold text-chalk mb-4 font-display">Delivery Address</h2>
              <div className="bg-surface border border-border p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Full Name *</label>
                    <input value={delivery.fullName} onChange={field('fullName')} placeholder="Jane Doe" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Phone *</label>
                    <input value={delivery.phone} onChange={field('phone')} placeholder="+91 98765 43210" className={inputCls} type="tel" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Address Line 1 *</label>
                    <input value={delivery.addressLine1} onChange={field('addressLine1')} placeholder="House no., street name" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Address Line 2 (optional)</label>
                    <input value={delivery.addressLine2} onChange={field('addressLine2')} placeholder="Apartment, landmark" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">City *</label>
                    <input value={delivery.city} onChange={field('city')} placeholder="Mumbai" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">State *</label>
                    <input value={delivery.state} onChange={field('state')} placeholder="Maharashtra" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Pincode *</label>
                    <input value={delivery.pincode} onChange={field('pincode')} placeholder="400001" className={inputCls} maxLength={6} />
                  </div>
                </div>
              </div>
            </div>
            <OrderSidebar
              action={
                <>
                  <button
                    disabled={!allFieldsFilled}
                    onClick={() => setStep('payment')}
                    className="w-full py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Payment →
                  </button>
                  <button onClick={() => setStep('summary')} className="w-full mt-2 py-[11px] border border-border text-chalk-3 text-xs font-semibold hover:border-acid hover:text-acid transition-all uppercase">
                    ← Back
                  </button>
                </>
              }
            />
          </div>
        )}

        {/* ── STEP 3: PAYMENT ── */}
        {step === 'payment' && (
          <div className="grid grid-cols-[1fr_380px] gap-8">
            <div>
              <h2 className="text-lg font-bold text-chalk mb-4 font-display">Payment Method</h2>
              <div className="bg-surface border border-border p-6">
                <div className="flex flex-col gap-3">
                  {([
                    { value: 'cod' as const, label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '📦' },
                    { value: 'upi' as const, label: 'UPI / Razorpay', sub: 'Pay instantly — UPI, Card, NetBanking', icon: '📱' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPayMethod(opt.value)}
                      className={`flex items-center gap-4 p-4 border text-left transition-all ${
                        payMethod === opt.value
                          ? 'border-acid bg-[rgba(204,255,0,.06)]'
                          : 'border-border hover:border-border-hi'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-chalk">{opt.label}</span>
                        </div>
                        <div className="text-xs text-chalk-3">{opt.sub}</div>
                      </div>
                      <div className={`w-4 h-4 border-2 flex items-center justify-center ${payMethod === opt.value ? 'border-acid' : 'border-border'}`}>
                        {payMethod === opt.value && <div className="w-2 h-2 bg-acid" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivering to summary */}
              <div className="mt-4 bg-surface border border-border p-4">
                <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-2">Delivering to</p>
                <p className="text-sm font-semibold text-chalk">{delivery.fullName}</p>
                <p className="text-xs text-chalk-3 mt-0.5">{delivery.addressLine1}{delivery.addressLine2 ? `, ${delivery.addressLine2}` : ''}</p>
                <p className="text-xs text-chalk-3">{delivery.city}, {delivery.state} — {delivery.pincode}</p>
                <p className="text-xs text-chalk-3">{delivery.phone}</p>
              </div>

              {placeError && (
                <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                  {placeError}
                </div>
              )}
            </div>

            <OrderSidebar
              action={
                <>
                  <button
                    onClick={placeOrder}
                    disabled={placing}
                    className="w-full py-[14px] bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? 'Placing Order…' : 'Place Order →'}
                  </button>
                  <button onClick={() => setStep('delivery')} className="w-full mt-2 py-[11px] border border-border text-chalk-3 text-xs font-semibold hover:border-acid hover:text-acid transition-all uppercase">
                    ← Back
                  </button>
                </>
              }
            />
          </div>
        )}

        {/* ── STEP 4: CONFIRMED ── */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="max-w-[600px] mx-auto text-center py-10">
            <div className="w-16 h-16 bg-[rgba(204,255,0,.12)] border border-acid flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 stroke-acid" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">Order Placed!</h2>
            <p className="text-chalk-2 text-sm mb-1">
              Thank you, <span className="text-chalk font-semibold">{delivery.fullName || 'Beauty Lover'}</span>
            </p>
            <div className="inline-block bg-surface border border-border px-6 py-3 my-5">
              <div className="text-xs text-chalk-3 uppercase tracking-[0.06em] mb-1">Order Number</div>
              <div className="text-lg font-bold text-acid font-display">{confirmedOrder.number}</div>
            </div>
            <p className="text-chalk-3 text-sm mb-2">
              Payment: <span className="text-chalk capitalize">{payMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            </p>
            <p className="text-chalk-3 text-sm mb-8">
              Expected delivery in 3–5 business days.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/products" className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
                Continue Shopping
              </Link>
              <Link href="/account" className="px-6 py-3 border border-border text-chalk-2 text-sm font-semibold hover:border-acid hover:text-acid transition-all uppercase">
                My Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
