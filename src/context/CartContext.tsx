'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { CartItem } from '@/types/product'

interface CartContextValue {
  items: CartItem[]
  count: number
  addItem: (item: Omit<CartItem, 'quantity' | 'lineKey'>) => void
  removeItem: (lineKey: string) => void
  updateQty: (lineKey: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'maison_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  function makeLineKey(id: string, shade?: string, size?: string) {
    return [id, shade ?? '', size ?? ''].join(':')
  }

  const addItem = useCallback((item: Omit<CartItem, 'quantity' | 'lineKey'>) => {
    const lineKey = makeLineKey(item.id, item.shade, item.size)
    setItems(prev => {
      const existing = prev.find(i => i.lineKey === lineKey)
      if (existing) {
        return prev.map(i => i.lineKey === lineKey ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, lineKey, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((lineKey: string) => {
    setItems(prev => prev.filter(i => i.lineKey !== lineKey))
  }, [])

  const updateQty = useCallback((lineKey: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.lineKey === lineKey ? { ...i, quantity: qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
