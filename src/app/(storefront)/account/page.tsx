'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

type Tab = 'profile' | 'orders' | 'addresses' | 'rewards' | 'returns'

interface Profile { name: string; email: string; phone: string; loyaltyPoints: number }
const EMPTY_PROFILE: Profile = { name: '', email: '', phone: '', loyaltyPoints: 0 }

interface Address {
  id: number
  addressType: string
  isDefault: boolean | null
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  country: string
  landmark: string | null
}

const EMPTY_ADDR = { fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', landmark: '' }

interface ReturnItem {
  id: number
  returnNumber: string
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded'
  reason: string
  refundMethod: string | null
  orderNumber: string
  orderId: number
  createdAt: string | null
}

interface DeliveredOrder {
  id: number
  orderNumber: string
}

const EMPTY_RETURN_FORM = { orderId: '', reason: '', refundMethod: 'original_payment', reasonDetails: '' }

const RETURN_STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-acid bg-acid/10 border-acid/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  received: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  refunded: 'text-chalk-2 bg-void-2 border-border',
}

export default function AccountPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>('profile')

  // Profile state
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [editingAddr, setEditingAddr] = useState<Address | null>(null)
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR)
  const [addrSaving, setAddrSaving] = useState(false)

  // Returns state
  const [returns, setReturns] = useState<ReturnItem[]>([])
  const [returnsLoading, setReturnsLoading] = useState(true)
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([])
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnForm, setReturnForm] = useState(EMPTY_RETURN_FORM)
  const [returnSubmitting, setReturnSubmitting] = useState(false)
  const [returnError, setReturnError] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setProfile({ name: data.name ?? '', email: data.email ?? '', phone: data.phone ?? '', loyaltyPoints: data.loyaltyPoints ?? 0 })
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false))
  }, [])

  useEffect(() => {
    if (session?.user?.email && !profile.email) {
      setProfile(p => ({ ...p, email: session.user?.email ?? '' }))
    }
  }, [session])

  useEffect(() => {
    if (tab !== 'addresses') return
    loadAddresses()
  }, [tab])

  useEffect(() => {
    if (tab !== 'returns') return
    loadReturns()
    loadDeliveredOrders()
  }, [tab])

  function loadReturns() {
    setReturnsLoading(true)
    fetch('/api/returns')
      .then(r => r.ok ? r.json() : { returns: [] })
      .then(data => setReturns(data.returns ?? []))
      .catch(() => {})
      .finally(() => setReturnsLoading(false))
  }

  function loadDeliveredOrders() {
    fetch('/api/orders?status=delivered')
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(data => setDeliveredOrders((data.orders ?? []).map((o: { id: number; orderNumber: string }) => ({ id: o.id, orderNumber: o.orderNumber }))))
      .catch(() => {})
  }

  async function submitReturn(e: React.FormEvent) {
    e.preventDefault()
    setReturnSubmitting(true)
    setReturnError('')
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(returnForm.orderId),
          reason: returnForm.reason,
          refundMethod: returnForm.refundMethod,
          reasonDetails: returnForm.reasonDetails || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setReturnError(data.error ?? 'Failed to submit return request')
        return
      }
      setShowReturnForm(false)
      setReturnForm(EMPTY_RETURN_FORM)
      loadReturns()
    } finally {
      setReturnSubmitting(false)
    }
  }

  function loadAddresses() {
    setAddrLoading(true)
    fetch('/api/addresses')
      .then(r => r.ok ? r.json() : { addresses: [] })
      .then(data => setAddresses(data.addresses ?? []))
      .catch(() => {})
      .finally(() => setAddrLoading(false))
  }

  async function saveProfile() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    setAddrSaving(true)
    try {
      if (editingAddr) {
        await fetch(`/api/addresses/${editingAddr.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrForm),
        })
      } else {
        await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addrForm),
        })
      }
      setShowAddrForm(false)
      setEditingAddr(null)
      setAddrForm(EMPTY_ADDR)
      loadAddresses()
    } finally {
      setAddrSaving(false)
    }
  }

  async function deleteAddress(id: number) {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    loadAddresses()
  }

  async function setDefault(id: number) {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setDefault: true }),
    })
    loadAddresses()
  }

  function startEdit(addr: Address) {
    setEditingAddr(addr)
    setAddrForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      landmark: addr.landmark ?? '',
    })
    setShowAddrForm(true)
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><circle cx="12" cy="8" r="4" strokeLinecap="round"/><path strokeLinecap="round" d="M4 20 C4 16 7.6 13 12 13 C16.4 13 20 16 20 20"/></svg> },
    { key: 'orders', label: 'My Orders', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8L12 3L3 8V16L12 21L21 16V8Z"/><path strokeLinecap="round" d="M3 8L12 13L21 8"/><line x1="12" y1="13" x2="12" y2="21" strokeLinecap="round"/></svg> },
    { key: 'addresses', label: 'Addresses', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/><circle cx="12" cy="9" r="2.5" strokeLinecap="round"/></svg> },
    { key: 'rewards', label: 'Rewards', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
    { key: 'returns', label: 'Returns', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9L9 4"/><path strokeLinecap="round" d="M4 9H15C17.8 9 20 11.2 20 14C20 16.8 17.8 19 15 19H11"/></svg> },
  ]

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Account
          </div>
          <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
            My <span className="text-acid">Account</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="bg-surface border border-border p-4 h-fit md:sticky md:top-[120px]">
            <div className="flex md:flex-col gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 text-sm font-semibold whitespace-nowrap transition-all ${
                    tab === t.key
                      ? 'bg-[rgba(140,90,60,0.08)] text-acid border-b-2 md:border-b-0 md:border-l-2 border-acid'
                      : 'text-chalk-2 hover:text-chalk border-b-2 md:border-b-0 md:border-l-2 border-transparent hover:bg-void-3'
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
            <div className="hidden md:block p-3 border-t border-border mt-2">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-void-3 transition-colors border-l-2 border-transparent"
              >
                <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {tab === 'profile' && (
              <div>
                <h2 className="text-lg font-bold text-chalk mb-4 font-display">Profile Information</h2>
                <div className="bg-surface border border-border p-6 max-w-[480px]">
                  {profileLoading ? (
                    <div className="text-sm text-chalk-3">Loading...</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          readOnly
                          className="w-full bg-void-2 border border-border px-3 py-[10px] text-sm text-chalk-3 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                          className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={saveProfile}
                    disabled={saving || profileLoading}
                    className="mt-5 px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50"
                  >
                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h2 className="text-lg font-bold text-chalk mb-4 font-display">My Orders</h2>
                <div className="bg-surface border border-border p-8 text-center">
                  <p className="text-chalk-2 mb-4">View your full order history and track shipments.</p>
                  <Link href="/account/orders" className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
                    View All Orders
                  </Link>
                </div>
              </div>
            )}

            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-chalk font-display">Saved Addresses</h2>
                  <button
                    onClick={() => { setShowAddrForm(true); setEditingAddr(null); setAddrForm(EMPTY_ADDR) }}
                    className="px-4 py-2 bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
                  >
                    + Add New Address
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={saveAddress} className="mb-6 bg-surface border border-border p-6">
                    <h3 className="text-sm font-bold text-chalk mb-4">{editingAddr ? 'Edit Address' : 'New Address'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
                        { key: 'phone', label: 'Phone', type: 'tel', required: true, maxLength: 20 },
                        { key: 'addressLine1', label: 'Address Line 1', type: 'text', required: true, colSpan: true },
                        { key: 'addressLine2', label: 'Address Line 2', type: 'text', required: false, colSpan: true },
                        { key: 'city', label: 'City', type: 'text', required: true },
                        { key: 'state', label: 'State', type: 'text', required: true },
                        { key: 'pincode', label: 'Pincode', type: 'text', required: true, maxLength: 10 },
                        { key: 'country', label: 'Country', type: 'text', required: true },
                        { key: 'landmark', label: 'Landmark', type: 'text', required: false },
                      ].map(field => (
                        <div key={field.key} className={(field as any).colSpan ? 'col-span-2' : ''}>
                          <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            required={field.required}
                            maxLength={(field as any).maxLength}
                            value={(addrForm as any)[field.key]}
                            onChange={e => setAddrForm(p => ({ ...p, [field.key]: e.target.value }))}
                            className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" disabled={addrSaving} className="px-5 py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50">
                        {addrSaving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => { setShowAddrForm(false); setEditingAddr(null) }} className="px-5 py-2.5 border border-border text-chalk-2 text-sm font-semibold hover:border-acid hover:text-acid transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addrLoading ? (
                  <div className="p-6 text-sm text-chalk-3">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="bg-surface border border-border p-12 text-center">
                    <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/><circle cx="12" cy="9" r="2.5" strokeLinecap="round"/></svg>
                    </div>
                    <p className="text-chalk-2 font-semibold mb-1">No saved addresses</p>
                    <p className="text-chalk-3 text-sm">Add an address to speed up checkout</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className="bg-surface border border-border p-5 relative">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-chalk">{addr.fullName}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-acid border border-acid px-1.5 py-0.5 uppercase tracking-[0.06em]">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-chalk-2">{addr.phone}</p>
                            <p className="text-sm text-chalk-2 mt-1">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}
                            </p>
                            <p className="text-sm text-chalk-2">
                              {addr.city}, {addr.state} – {addr.pincode}
                            </p>
                            <p className="text-sm text-chalk-2">{addr.country}</p>
                            {addr.landmark && <p className="text-xs text-chalk-3 mt-1">Landmark: {addr.landmark}</p>}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button onClick={() => startEdit(addr)} className="text-xs text-chalk-2 hover:text-acid transition-colors font-semibold">Edit</button>
                            {!addr.isDefault && (
                              <button onClick={() => setDefault(addr.id)} className="text-xs text-chalk-2 hover:text-acid transition-colors font-semibold">Set Default</button>
                            )}
                            <button onClick={() => deleteAddress(addr.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold">Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'returns' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-chalk font-display">Return Requests</h2>
                  {!showReturnForm && (
                    <button
                      onClick={() => { setShowReturnForm(true); setReturnError('') }}
                      className="px-4 py-2 bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
                    >
                      + Request a Return
                    </button>
                  )}
                </div>

                {showReturnForm && (
                  <form onSubmit={submitReturn} className="mb-6 bg-surface border border-border p-6">
                    <h3 className="text-sm font-bold text-chalk mb-4">New Return Request</h3>
                    {returnError && (
                      <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {returnError}
                      </div>
                    )}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Order</label>
                        {deliveredOrders.length > 0 ? (
                          <select
                            required
                            value={returnForm.orderId}
                            onChange={e => setReturnForm(p => ({ ...p, orderId: e.target.value }))}
                            className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk outline-none focus:border-acid transition-colors"
                          >
                            <option value="">Select a delivered order…</option>
                            {deliveredOrders.map(o => (
                              <option key={o.id} value={o.id}>{o.orderNumber}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            required
                            placeholder="Order ID"
                            value={returnForm.orderId}
                            onChange={e => setReturnForm(p => ({ ...p, orderId: e.target.value }))}
                            className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Reason</label>
                        <select
                          required
                          value={returnForm.reason}
                          onChange={e => setReturnForm(p => ({ ...p, reason: e.target.value }))}
                          className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk outline-none focus:border-acid transition-colors"
                        >
                          <option value="">Select a reason…</option>
                          <option value="defective">Defective product</option>
                          <option value="wrong_item">Wrong item received</option>
                          <option value="not_as_described">Not as described</option>
                          <option value="damaged">Damaged in transit</option>
                          <option value="changed_mind">Changed mind</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Refund Method</label>
                        <select
                          required
                          value={returnForm.refundMethod}
                          onChange={e => setReturnForm(p => ({ ...p, refundMethod: e.target.value }))}
                          className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk outline-none focus:border-acid transition-colors"
                        >
                          <option value="original_payment">Original payment method</option>
                          <option value="store_credit">Store credit</option>
                          <option value="replacement">Replacement</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Additional Details <span className="text-chalk-3 normal-case">(optional)</span></label>
                        <textarea
                          rows={3}
                          value={returnForm.reasonDetails}
                          onChange={e => setReturnForm(p => ({ ...p, reasonDetails: e.target.value }))}
                          placeholder="Describe the issue…"
                          className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={returnSubmitting}
                        className="px-5 py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50"
                      >
                        {returnSubmitting ? 'Submitting…' : 'Submit Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowReturnForm(false); setReturnError('') }}
                        className="px-5 py-2.5 border border-border text-chalk-2 text-sm font-semibold hover:border-acid hover:text-acid transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {returnsLoading ? (
                  <div className="p-6 text-sm text-chalk-3">Loading returns…</div>
                ) : returns.length === 0 ? (
                  <div className="bg-surface border border-border p-12 text-center">
                    <div className="text-5xl mb-4">↩</div>
                    <p className="text-chalk-2 font-semibold mb-1">No return requests yet</p>
                    <p className="text-chalk-3 text-sm">You can request a return for delivered orders</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {returns.map(ret => (
                      <div key={ret.id} className="bg-surface border border-border p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-bold text-chalk">{ret.returnNumber}</span>
                              <span className={`text-[10px] font-bold border px-1.5 py-0.5 uppercase tracking-[0.06em] ${RETURN_STATUS_COLORS[ret.status] ?? 'text-chalk-3 border-border'}`}>
                                {ret.status}
                              </span>
                            </div>
                            <p className="text-xs text-chalk-3 mb-2">Order: {ret.orderNumber}</p>
                            <p className="text-sm text-chalk-2">
                              Reason: <span className="text-chalk">{ret.reason.replace(/_/g, ' ')}</span>
                            </p>
                            {ret.refundMethod && (
                              <p className="text-sm text-chalk-2">
                                Refund via: <span className="text-chalk">{ret.refundMethod.replace(/_/g, ' ')}</span>
                              </p>
                            )}
                          </div>
                          {ret.createdAt && (
                            <span className="text-xs text-chalk-3 whitespace-nowrap">
                              {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'rewards' && (() => {
              const TIERS = [
                { name: 'Pearl',    points: 0 },
                { name: 'Gold',     points: 400 },
                { name: 'Platinum', points: 1000 },
                { name: 'Diamond',  points: 2500 },
              ]
              const pts = profile.loyaltyPoints
              const tierIdx = TIERS.reduce((idx, t, i) => pts >= t.points ? i : idx, 0)
              const tierCurrent = TIERS[tierIdx]
              const tierNext = TIERS[tierIdx + 1]
              const pointsToNext = tierNext ? tierNext.points - pts : null
              const rewardCards = [
                { label: 'Points Balance', value: String(pts), sub: 'points' },
                { label: 'Current Tier', value: tierCurrent.name, sub: 'member' },
                { label: 'Points to Next Tier', value: pointsToNext !== null ? String(pointsToNext) : '—', sub: pointsToNext !== null ? `to ${tierNext!.name}` : 'Max tier reached' },
              ]
              return (
                <div>
                  <h2 className="text-lg font-bold text-chalk mb-4 font-display">Rewards & Points</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {rewardCards.map(card => (
                      <div key={card.label} className="bg-surface border border-border p-5 text-center">
                        <div className="text-[28px] font-extrabold text-acid font-display">{card.value}</div>
                        <div className="text-xs text-chalk-3 mt-1">{card.sub}</div>
                        <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em] mt-2">{card.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-surface border border-border p-6">
                    <p className="text-sm text-chalk-2">Earn 1 point for every ₹100 spent. Redeem 100 points for ₹1 off.</p>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
