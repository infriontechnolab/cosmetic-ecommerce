import { getProductsByBrand } from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  return { title: `${label} — MAISON` }
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
]

const PER_PAGE = 20

export default async function BrandPage({
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

  let products = await getProductsByBrand(name)

  const parsePrice = (p: string) => parseFloat(p.replace(/[₹,\s]/g, '')) || 0
  if (sort === 'price-asc') products = [...products].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  else if (sort === 'price-desc') products = [...products].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
  else if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating)

  const total = products.length
  const totalPages = Math.ceil(total / PER_PAGE)
  const paged = products.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const href = (overrides: Record<string, string>) => {
    const q = new URLSearchParams({ sort, page: String(page), ...overrides })
    return `/brand/${name}?${q}`
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
                {' / '}Brands{' / '}{label}
              </div>
              <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
                <span className="text-acid">{label}</span>
              </h1>
              <p className="text-chalk-3 text-sm mt-1">{total} products</p>
            </div>

            {/* Sort */}
            {total > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-chalk-3 font-medium">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map(opt => (
                    <Link
                      key={opt.value}
                      href={href({ sort: opt.value, page: '1' })}
                      className={`px-3 py-[6px] text-xs font-semibold border transition-all ${
                        sort === opt.value
                          ? 'border-acid text-acid bg-[rgba(204,255,0,.06)]'
                          : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk-2'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {paged.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-chalk-2 text-lg font-semibold mb-2">No products found for this brand</p>
            <p className="text-chalk-3 text-sm mb-6">Check back soon or explore our full collection</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
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
                        ? 'border-acid text-acid bg-[rgba(204,255,0,.06)]'
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
