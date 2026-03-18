'use client'
import { useState, useEffect } from 'react'

export function useScrollShadow(threshold = 30) {
  const [shadowed, setShadowed] = useState(false)
  useEffect(() => {
    const handler = () => setShadowed(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return shadowed
}
