'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
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
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const isWished = useCallback((id: string) => items.some(p => p.id === id), [items])

  const toggleWish = useCallback((product: Product) => {
    setItems(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      return [...prev, product]
    })
  }, [])

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
