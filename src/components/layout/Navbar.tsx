'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import navCats from '@/data/nav-categories.json'

const LABEL_TO_SLUG: Record<string, string> = {
  "What's New": 'whats-new',
  'Makeup': 'makeup',
  'Skin': 'skincare',
  'Hair': 'hair',
  'Fragrance': 'fragrance',
  'Men': 'men',
  'Bath & Body': 'bath-body',
  'Tools': 'tools',
  'Wellness': 'wellness',
  'Minis': 'minis',
  'Gifts': 'gifts',
  'Offers': 'offers',
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Close account dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Focus search input when opened; close on Escape
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileMenuOpen(false) }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [searchOpen])

  function handleSearch() {
    const q = searchQuery.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setSearchOpen(false)
      setMobileMenuOpen(false)
    }
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  function getActiveTab(): number {
    const match = pathname.match(/^\/category\/(.+)/)
    if (match) {
      const slug = match[1]
      const idx = navCats.findIndex(cat => LABEL_TO_SLUG[cat.label] === slug)
      return idx
    }
    return -1
  }

  const activeTab = getActiveTab()

  return (
    <nav className="sticky top-0 z-[800] bg-void border-b border-border transition-shadow duration-200">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative flex items-center h-[60px] sm:h-[68px]">

        {/* ── Mobile: Hamburger (left) ── Desktop: Account + Wishlist + Cart (left) */}
        <div className="flex items-center gap-0.5">

          {/* Hamburger — mobile only */}
          <button
            className="flex flex-col items-center justify-center gap-0.5 w-[44px] h-[44px] text-chalk-2 hover:text-acid transition-all md:hidden"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>

          {/* Account — desktop only */}
          <div ref={accountRef} className="relative hidden md:block">
            <button
              onClick={() => setAccountOpen(o => !o)}
              className={`flex flex-col items-center justify-center gap-0.5 w-[52px] h-[52px] transition-all ${accountOpen || status === 'authenticated' ? 'text-acid' : 'text-chalk-2 hover:text-acid'}`}
            >
              <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-[10px] font-bold">
                {status === 'authenticated' ? (session.user?.name?.split(' ')[0] ?? 'Account') : 'Account'}
              </span>
            </button>

            {accountOpen && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-void border border-border shadow-xl z-50 py-1">
                {status === 'authenticated' ? (
                  <>
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-xs font-semibold text-chalk truncate">{session.user?.name}</p>
                      <p className="text-[11px] text-chalk-3 truncate">{session.user?.email}</p>
                    </div>
                    <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-chalk-2 hover:text-chalk hover:bg-surface transition-colors">
                      <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Account
                    </Link>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-chalk-2 hover:text-chalk hover:bg-surface transition-colors">
                      <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      My Orders
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button onClick={() => { setAccountOpen(false); signOut({ callbackUrl: '/' }) }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-surface transition-colors">
                        <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-chalk-2 hover:text-chalk hover:bg-surface transition-colors">Sign In</Link>
                    <Link href="/sign-up" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-acid font-semibold hover:bg-surface transition-colors">Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist — desktop only */}
          <Link href="/wishlist" className="hidden md:flex flex-col items-center justify-center gap-0.5 w-[52px] h-[52px] text-chalk-2 hover:text-acid transition-all relative">
            {wishCount > 0 && (
              <div className="absolute top-[5px] right-[5px] min-w-[16px] h-[16px] bg-acid text-void text-[9px] font-bold flex items-center justify-center px-1">{wishCount}</div>
            )}
            <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className="text-[10px] font-bold">Wishlist</span>
          </Link>

          {/* Cart — desktop only */}
          <Link href="/cart" className="hidden md:flex flex-col items-center justify-center gap-0.5 w-[52px] h-[52px] text-chalk-2 hover:text-acid transition-all relative">
            {count > 0 && (
              <div className="absolute top-[5px] right-[5px] min-w-[16px] h-[16px] bg-acid text-void text-[9px] font-bold flex items-center justify-center px-1">{count}</div>
            )}
            <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span className="text-[10px] font-bold">Bag</span>
          </Link>
        </div>

        {/* Center: Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-[18px] sm:text-[20px] font-black tracking-[0.22em] text-chalk whitespace-nowrap font-display hover:text-acid transition-colors"
        >
          MAISON<span className="text-acid text-[22px] sm:text-[24px] leading-none relative -top-[1px]">.</span>
        </Link>

        {/* Right: EXCLUSIVE + OFFERS + Search (desktop) | Cart icon (mobile) */}
        <div className="ml-auto flex items-center gap-1">
          {/* Desktop only */}
          <Link href="/products" className="hidden md:block px-4 py-[6px] text-[11px] font-black border border-acid text-acid hover:bg-acid hover:text-void transition-all tracking-[0.1em]">EXCLUSIVE</Link>
          <Link href="/products?sort=price-asc" className="hidden md:block px-4 py-[6px] text-[11px] font-black bg-void-3 text-chalk-2 border border-border hover:border-acid hover:text-acid transition-all tracking-[0.1em]">OFFERS</Link>
          <button
            onClick={() => setSearchOpen(o => !o)}
            className={`hidden md:flex flex-col items-center justify-center gap-0.5 w-[52px] h-[52px] transition-all ${searchOpen ? 'text-acid' : 'text-chalk-2 hover:text-acid'}`}
            aria-label="Toggle search"
          >
            {searchOpen ? (
              <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            )}
            <span className="text-[10px] font-bold">Search</span>
          </button>

          {/* Mobile: search icon */}
          <button
            onClick={() => setSearchOpen(o => !o)}
            className={`flex items-center justify-center w-[44px] h-[44px] md:hidden transition-all ${searchOpen ? 'text-acid' : 'text-chalk-2'}`}
            aria-label="Search"
          >
            <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>

          {/* Mobile: cart icon */}
          <Link href="/cart" className="relative flex items-center justify-center w-[44px] h-[44px] md:hidden text-chalk-2 hover:text-acid transition-all">
            {count > 0 && (
              <div className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] bg-acid text-void text-[9px] font-bold flex items-center justify-center px-1">{count}</div>
            )}
            <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </Link>
        </div>
      </div>

      {/* ── Search bar (desktop collapsible) ─────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-border ${searchOpen ? 'max-h-[64px]' : 'max-h-0 border-t-0'}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex-1 flex items-center bg-surface border-[1.5px] border-border px-[14px] gap-[10px] transition-all duration-200 focus-within:border-acid">
            <svg className="w-[17px] h-[17px] stroke-chalk-3 flex-shrink-0" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search for serums, lipstick, Charlotte Tilbury…"
              className="flex-1 border-none bg-transparent font-sans text-sm text-chalk outline-none py-[11px] placeholder:text-chalk-3"
            />
          </div>
          <button onClick={handleSearch} className="px-[18px] py-[11px] bg-acid text-void text-xs font-bold flex-shrink-0 hover:bg-acid-dim transition-colors">
            Search →
          </button>
          <button onClick={() => setSearchOpen(false)} className="flex items-center justify-center w-9 h-9 text-chalk-3 hover:text-chalk transition-colors flex-shrink-0" aria-label="Close search">
            <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* ── Category strip (desktop) ──────────────────────── */}
      <div className="hidden md:block border-t border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center">
          {navCats.map((cat, i) => {
            const slug = LABEL_TO_SLUG[cat.label] || cat.label.toLowerCase().replace(/\s+/g, '-')
            const isLast = i === navCats.length - 1
            const isActive = activeTab === i
            return (
              <Link
                key={cat.label}
                href={isLast ? '/products' : `/category/${slug}`}
                className={`px-[18px] py-[12px] text-[11px] font-black tracking-[0.2em] uppercase whitespace-nowrap border-b-[3px] transition-all ${
                  isLast
                    ? 'text-acid border-transparent hover:border-acid'
                    : isActive
                      ? 'text-acid border-acid bg-acid/5'
                      : 'text-chalk-3 border-transparent hover:text-chalk hover:border-border'
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-border bg-void ${mobileMenuOpen ? 'max-h-[90vh] overflow-y-auto' : 'max-h-0 border-t-0'}`}>
        <div className="px-4 py-4 flex flex-col gap-1">

          {/* Auth section */}
          {status === 'authenticated' ? (
            <div className="pb-3 mb-3 border-b border-border">
              <div className="text-xs font-semibold text-chalk mb-0.5">{session.user?.name}</div>
              <div className="text-[11px] text-chalk-3 mb-3">{session.user?.email}</div>
              <div className="flex gap-2">
                <Link href="/account" className="flex-1 py-2 text-center text-xs font-bold border border-border text-chalk-2 hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em]">My Account</Link>
                <Link href="/wishlist" className="flex-1 py-2 text-center text-xs font-bold border border-border text-chalk-2 hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em] relative">
                  Wishlist {wishCount > 0 && <span className="ml-1 text-acid">({wishCount})</span>}
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex-1 py-2 text-center text-xs font-bold border border-border text-red-400 hover:border-red-400 transition-all uppercase tracking-[0.04em]">Sign Out</button>
              </div>
            </div>
          ) : (
            <div className="pb-3 mb-3 border-b border-border flex gap-2">
              <Link href="/sign-in" className="flex-1 py-2.5 text-center text-xs font-bold border border-border text-chalk-2 uppercase tracking-[0.04em]">Sign In</Link>
              <Link href="/sign-up" className="flex-1 py-2.5 text-center text-xs font-bold bg-acid text-void uppercase tracking-[0.04em]">Join Maison</Link>
            </div>
          )}

          {/* Category links */}
          <div className="text-[10px] font-black tracking-[0.18em] uppercase text-chalk-3 mb-2">Shop</div>
          <div className="grid grid-cols-2 gap-1">
            {navCats.map((cat, i) => {
              const slug = LABEL_TO_SLUG[cat.label] || cat.label.toLowerCase().replace(/\s+/g, '-')
              const isLast = i === navCats.length - 1
              return (
                <Link
                  key={cat.label}
                  href={isLast ? '/products' : `/category/${slug}`}
                  className={`py-2.5 px-3 text-[12px] font-bold uppercase tracking-[0.06em] border transition-all ${isLast ? 'text-acid border-acid/30 bg-acid/5' : 'text-chalk-2 border-border hover:border-acid hover:text-acid'}`}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>

          {/* Quick links */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <Link href="/products" className="flex-1 py-2 text-center text-xs font-black border border-acid text-acid uppercase tracking-[0.08em]">Exclusive</Link>
            <Link href="/products?sort=price-asc" className="flex-1 py-2 text-center text-xs font-black border border-border text-chalk-2 uppercase tracking-[0.08em]">Offers</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
