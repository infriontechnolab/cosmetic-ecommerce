'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type Tab = 'profile' | 'orders' | 'addresses' | 'rewards'

interface Profile { name: string; email: string; phone: string }
const EMPTY_PROFILE: Profile = { name: '', email: '', phone: '' }

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const p = localStorage.getItem('maison_profile')
      if (p) setProfile(JSON.parse(p))
    } catch {}
  }, [])

  function saveProfile() {
    try { localStorage.setItem('maison_profile', JSON.stringify(profile)) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'orders', label: 'My Orders', icon: '📦' },
    { key: 'addresses', label: 'Addresses', icon: '📍' },
    { key: 'rewards', label: 'Rewards', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Account
          </div>
          <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
            My <span className="text-acid">Account</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <div className="bg-surface border border-border p-4 h-fit sticky top-[120px]">
            <div className="flex flex-col gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left transition-all ${
                    tab === t.key
                      ? 'bg-[rgba(204,255,0,.08)] text-acid border-l-2 border-acid'
                      : 'text-chalk-2 hover:text-chalk border-l-2 border-transparent hover:bg-void-3'
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-border mt-2">
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
                        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@email.com"
                        className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
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
                  <button
                    onClick={saveProfile}
                    className="mt-5 px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
                  >
                    {saved ? '✓ Saved!' : 'Save Changes'}
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
                <h2 className="text-lg font-bold text-chalk mb-4 font-display">Saved Addresses</h2>
                <div className="bg-surface border border-border p-12 text-center">
                  <div className="text-5xl mb-4">📍</div>
                  <p className="text-chalk-2 font-semibold mb-1">No saved addresses</p>
                  <p className="text-chalk-3 text-sm">Addresses saved during checkout will appear here</p>
                </div>
              </div>
            )}
            {tab === 'rewards' && (
              <div>
                <h2 className="text-lg font-bold text-chalk mb-4 font-display">Rewards & Points</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Points Balance', value: '0', sub: 'points' },
                    { label: 'Current Tier', value: 'Bronze', sub: 'member' },
                    { label: 'Points to Next Tier', value: '1000', sub: 'to Silver' },
                  ].map(card => (
                    <div key={card.label} className="bg-surface border border-border p-5 text-center">
                      <div className="text-[28px] font-extrabold text-acid font-display">{card.value}</div>
                      <div className="text-xs text-chalk-3 mt-1">{card.sub}</div>
                      <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em] mt-2">{card.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-surface border border-border p-6">
                  <p className="text-sm text-chalk-2">Earn 1 point for every $1 spent. Redeem 100 points for $1 off.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
