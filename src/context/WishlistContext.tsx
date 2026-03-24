'use client'
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import type { Product } from '@/types/product'

interface WishlistContextValue {
  items: Product[]
  count: number
  isWished: (id: string) => boolean
  toggleWish: (product: Product) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)
const STORAGE_KEY = 'maison_wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const isLoggedIn = !!session?.user
  const [items, setItems] = useState<Product[]>([])
  // Track if we've done the initial hydration
  const hydrated = useRef(false)

  // Hydrate on session status resolve
  useEffect(() => {
    if (status === 'loading') return
    if (hydrated.current) return
    hydrated.current = true

    if (isLoggedIn) {
      // Fetch from DB for logged-in users
      fetch('/api/wishlist')
        .then(r => r.ok ? r.json() : { data: [] })
        .then(json => setItems(json.data ?? []))
        .catch(() => {})
    } else {
      // Load from localStorage for guests
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setItems(JSON.parse(saved))
      } catch {}
    }
  }, [status, isLoggedIn])

  // Persist to localStorage for guests only
  useEffect(() => {
    if (!hydrated.current) return
    if (isLoggedIn) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, isLoggedIn])

  const isWished = useCallback((id: string) => items.some(p => p.id === id), [items])

  const toggleWish = useCallback((product: Product) => {
    const exists = items.some(p => p.id === product.id)

    // Optimistic update
    setItems(prev => {
      if (exists) return prev.filter(p => p.id !== product.id)
      return [...prev, product]
    })

    if (isLoggedIn) {
      if (exists) {
        fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' })
          .catch(() => {
            // Revert on error
            setItems(prev => [...prev, product])
          })
      } else {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: product.id }),
        }).catch(() => {
          // Revert on error
          setItems(prev => prev.filter(p => p.id !== product.id))
        })
      }
    }
  }, [items, isLoggedIn])

  const count = items.length

  return (
    <WishlistContext.Provider value={{ items, count, isWished, toggleWish }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
