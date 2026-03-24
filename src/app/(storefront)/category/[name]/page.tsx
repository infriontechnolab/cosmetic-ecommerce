import { getProductsByCategory } from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import type { ReactNode } from 'react'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  return { title: `${label} — MAISON` }
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  makeup: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <rect x="9.5" y="12.5" width="5" height="7" rx="0.4" strokeLinecap="round"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5 C9.5 12.5 9.5 8 12 6.5 C14.5 8 14.5 12.5 14.5 12.5"/>
      <line x1="9" y1="19.5" x2="15" y2="19.5" strokeLinecap="round"/>
      <line x1="9.5" y1="12.5" x2="14.5" y2="12.5" strokeLinecap="round"/>
      <circle cx="5.5" cy="10" r="2" strokeLinecap="round"/>
      <circle cx="5.5" cy="10" r="0.8" strokeLinecap="round"/>
    </svg>
  ),
  skincare: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10 C8 10 7.5 11 7.5 14 C7.5 18.5 9.5 20 12 20 C14.5 20 16.5 18.5 16.5 14 C16.5 11 16 10 15.5 10 Z"/>
      <path strokeLinecap="round" d="M9.5 10 C9.5 8.5 10.5 7.5 12 7.5 C13.5 7.5 14.5 8.5 14.5 10"/>
      <rect x="11" y="4.5" width="2" height="3" rx="1" strokeLinecap="round"/>
      <ellipse cx="12" cy="3.5" rx="1.8" ry="1.2" strokeLinecap="round"/>
      <line x1="9" y1="14" x2="15" y2="14" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  ),
  hair: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <ellipse cx="12" cy="8.5" rx="6" ry="4.5" strokeLinecap="round"/>
      <path strokeLinecap="round" d="M12 13 L12 21"/>
      <path strokeLinecap="round" d="M10.5 21 Q12 22 13.5 21"/>
      <line x1="9" y1="7" x2="9" y2="10" strokeLinecap="round"/>
      <line x1="11" y1="6" x2="11" y2="10" strokeLinecap="round"/>
      <line x1="13" y1="6" x2="13" y2="10" strokeLinecap="round"/>
      <line x1="15" y1="7" x2="15" y2="10" strokeLinecap="round"/>
    </svg>
  ),
  fragrance: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <rect x="7" y="10" width="10" height="10" rx="1.5" strokeLinecap="round"/>
      <rect x="10.5" y="6.5" width="3" height="3.5" rx="0.5" strokeLinecap="round"/>
      <rect x="9.5" y="4.5" width="5" height="2" rx="0.7" strokeLinecap="round"/>
      <path strokeLinecap="round" d="M14.5 5.5 L17.5 5.5 L17.5 4"/>
      <circle cx="18.5" cy="3.5" r="0.4" fill="currentColor"/>
      <circle cx="19.5" cy="4.5" r="0.4" fill="currentColor"/>
      <circle cx="18" cy="4.8" r="0.35" fill="currentColor"/>
      <line x1="8.5" y1="14" x2="15.5" y2="14" strokeLinecap="round" strokeOpacity="0.4"/>
      <line x1="8.5" y1="16.5" x2="13" y2="16.5" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  ),
  men: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <line x1="12" y1="12" x2="12" y2="21" strokeLinecap="round"/>
      <line x1="11" y1="15" x2="13" y2="15" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="11" y1="17" x2="13" y2="17" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="11" y1="19" x2="13" y2="19" strokeLinecap="round" strokeOpacity="0.5"/>
      <rect x="7" y="8.5" width="10" height="3.5" rx="0.5" strokeLinecap="round"/>
      <line x1="7.5" y1="10" x2="16.5" y2="10" strokeLinecap="round"/>
      <path strokeLinecap="round" d="M7.5 8.5 Q12 5.5 16.5 8.5"/>
    </svg>
  ),
  'bath-body': (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <rect x="5" y="12" width="14" height="8" rx="2.5" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="16" y2="16" strokeLinecap="round" strokeOpacity="0.4"/>
      <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" strokeLinecap="round" strokeOpacity="0.4"/>
      <circle cx="5.5" cy="9.5" r="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="8" r="1" strokeLinecap="round"/>
      <circle cx="13" cy="9" r="1.8" strokeLinecap="round"/>
      <circle cx="17.5" cy="8.5" r="1.2" strokeLinecap="round"/>
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" d="M12 13 L12 21"/>
      <path strokeLinecap="round" d="M11 21 Q12 22 13 21"/>
      <rect x="10.5" y="11" width="3" height="2.5" rx="0.3" strokeLinecap="round"/>
      <path strokeLinecap="round" d="M12 11 C12 11 7 8 5.5 4.5"/>
      <path strokeLinecap="round" d="M12 11 C12 11 8.5 7.5 9 4"/>
      <path strokeLinecap="round" d="M12 11 C12 11 11 7 12 3.5"/>
      <path strokeLinecap="round" d="M12 11 C12 11 13 7 12 3.5" strokeOpacity="0.6"/>
      <path strokeLinecap="round" d="M12 11 C12 11 15.5 7.5 15 4"/>
      <path strokeLinecap="round" d="M12 11 C12 11 17 8 18.5 4.5"/>
    </svg>
  ),
  wellness: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19 C12 19 8 16 8 12 C8 9.5 10 8 12 7 C14 8 16 9.5 16 12 C16 16 12 19 12 19 Z"/>
      <path strokeLinecap="round" d="M8 12 C8 12 4 11 3.5 8 C5.5 7 8 8.5 8 12"/>
      <path strokeLinecap="round" d="M16 12 C16 12 20 11 20.5 8 C18.5 7 16 8.5 16 12"/>
      <path strokeLinecap="round" d="M12 19 Q12 21.5 11 22.5"/>
      <path strokeLinecap="round" d="M12 19 Q12.5 21 12 22.5"/>
      <path strokeLinecap="round" d="M12 21 Q14 20 15 21.5"/>
    </svg>
  ),
  minis: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <rect x="3.5" y="14" width="4.5" height="6" rx="1.5" strokeLinecap="round"/>
      <rect x="5" y="12" width="1.5" height="2" rx="0.4" strokeLinecap="round"/>
      <rect x="4.5" y="11" width="2.5" height="1" rx="0.4" strokeLinecap="round"/>
      <rect x="9.5" y="10" width="5" height="10" rx="1" strokeLinecap="round"/>
      <rect x="11" y="7.5" width="2" height="2.5" rx="0.4" strokeLinecap="round"/>
      <rect x="10.5" y="6.5" width="3" height="1" rx="0.4" strokeLinecap="round"/>
      <rect x="16" y="12" width="4.5" height="8" rx="1.5" strokeLinecap="round"/>
      <rect x="17.5" y="10" width="1.5" height="2" rx="0.4" strokeLinecap="round"/>
      <rect x="17" y="9" width="2.5" height="1" rx="0.4" strokeLinecap="round"/>
    </svg>
  ),
  gifts: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <rect x="4" y="11" width="16" height="10" rx="0.5" strokeLinecap="round"/>
      <rect x="3" y="8" width="18" height="3" rx="0.5" strokeLinecap="round"/>
      <line x1="12" y1="8" x2="12" y2="21" strokeLinecap="round"/>
      <line x1="3" y1="9.5" x2="21" y2="9.5" strokeLinecap="round"/>
      <path strokeLinecap="round" d="M12 8 C10 5 7 5.5 7 7.5 C7 8.5 9 9 12 8"/>
      <path strokeLinecap="round" d="M12 8 C14 5 17 5.5 17 7.5 C17 8.5 15 9 12 8"/>
    </svg>
  ),
  'whats-new': (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      {/* Outer starburst ring — 8 radiating spokes */}
      <line x1="12" y1="2" x2="12" y2="4.5" strokeLinecap="round"/>
      <line x1="12" y1="19.5" x2="12" y2="22" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="4.5" y2="12" strokeLinecap="round"/>
      <line x1="19.5" y1="12" x2="22" y2="12" strokeLinecap="round"/>
      <line x1="4.93" y1="4.93" x2="6.64" y2="6.64" strokeLinecap="round"/>
      <line x1="17.36" y1="17.36" x2="19.07" y2="19.07" strokeLinecap="round"/>
      <line x1="19.07" y1="4.93" x2="17.36" y2="6.64" strokeLinecap="round"/>
      <line x1="6.64" y1="17.36" x2="4.93" y2="19.07" strokeLinecap="round"/>
      {/* Inner seal circle */}
      <circle cx="12" cy="12" r="5.5" strokeLinecap="round"/>
      {/* Center diamond mark */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.5 L13.5 12 L12 14.5 L10.5 12 Z"/>
    </svg>
  ),
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
]

const PER_PAGE = 20

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { name } = await params
  const sp = await searchParams
  const sort = sp.sort || 'featured'
  const page = Math.max(1, parseInt(sp.page || '1'))

  const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  const icon = CATEGORY_ICONS[name.toLowerCase()] ?? (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-8 h-8">
      <circle cx="12" cy="12" r="5.5" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="12" y2="4.5" strokeLinecap="round"/>
      <line x1="12" y1="19.5" x2="12" y2="22" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="4.5" y2="12" strokeLinecap="round"/>
      <line x1="19.5" y1="12" x2="22" y2="12" strokeLinecap="round"/>
      <line x1="4.93" y1="4.93" x2="6.64" y2="6.64" strokeLinecap="round"/>
      <line x1="17.36" y1="17.36" x2="19.07" y2="19.07" strokeLinecap="round"/>
      <line x1="19.07" y1="4.93" x2="17.36" y2="6.64" strokeLinecap="round"/>
      <line x1="6.64" y1="17.36" x2="4.93" y2="19.07" strokeLinecap="round"/>
    </svg>
  )

  let products = await getProductsByCategory(name)

  const parsePrice = (p: string) => parseFloat(p.replace(/[₹,\s]/g, '')) || 0
  if (sort === 'price-asc') products = [...products].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  else if (sort === 'price-desc') products = [...products].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
  else if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating)

  const total = products.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const paged = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const href = (overrides: Record<string, string>) => {
    const q = new URLSearchParams({ sort, page: String(page), ...overrides })
    return `/category/${name}?${q}`
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
                <Link href="/" className="hover:text-acid transition-colors">Home</Link>
                {' / '}
                <Link href="/products" className="hover:text-acid transition-colors">All Products</Link>
                {' / '}{label}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="flex-shrink-0"
                  style={{ color: 'var(--color-terracotta)' }}
                >
                  {icon}
                </span>
                <div>
                  <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
                    {label}
                  </h1>
                  <p className="text-chalk-3 text-sm mt-1">{total} products</p>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-chalk-3 font-medium">Sort by:</span>
              <div className="flex gap-2 flex-wrap">
                {SORT_OPTIONS.map(opt => (
                  <Link
                    key={opt.value}
                    href={href({ sort: opt.value, page: '1' })}
                    className={`px-3 py-[6px] text-xs font-semibold border transition-all ${
                      sort === opt.value
                        ? 'border-acid text-acid bg-[rgba(140,90,60,0.08)]'
                        : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk-2'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {paged.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><circle cx="11" cy="11" r="7" strokeLinecap="round"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round"/></svg>
            </div>
            <p className="text-chalk-2 text-lg font-semibold mb-2">No products in this category yet</p>
            <Link
              href="/products"
              className="mt-4 inline-block px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paged.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={href({ page: String(page - 1) })}
                    className="px-4 py-[8px] border border-border text-chalk-3 text-sm font-medium hover:border-acid hover:text-acid transition-all"
                  >
                    ← Prev
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Link
                    key={n}
                    href={href({ page: String(n) })}
                    className={`w-[38px] h-[38px] flex items-center justify-center text-sm font-medium border transition-all ${
                      n === page
                        ? 'border-acid text-acid bg-[rgba(140,90,60,0.08)]'
                        : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk-2'
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={href({ page: String(page + 1) })}
                    className="px-4 py-[8px] border border-border text-chalk-3 text-sm font-medium hover:border-acid hover:text-acid transition-all"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
