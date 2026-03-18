import { getProducts } from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

export const metadata = { title: 'All Products — MAISON' }

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const params = await searchParams
  const sort = params.sort || 'featured'
  const page = parseInt(params.page || '1')
  const perPage = 20

  let products = await getProducts()

  const parsePrice = (p: string) => parseFloat(p.replace(/[₹,\s]/g, '')) || 0
  if (sort === 'price-asc') products = [...products].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  else if (sort === 'price-desc') products = [...products].sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
  else if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating)

  const total = products.length
  const totalPages = Math.ceil(total / perPage)
  const paged = products.slice((page - 1) * perPage, page * perPage)

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'rating', label: 'Top Rated' },
  ]

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-1">
                <Link href="/" className="hover:text-acid transition-colors">Home</Link> / All Products
              </div>
              <h1 className="text-[32px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">
                All <span className="text-acid">Products</span>
              </h1>
              <p className="text-chalk-3 text-sm mt-1">{total} products</p>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-chalk-3 font-medium">Sort by:</span>
              <div className="flex gap-2">
                {sortOptions.map(opt => (
                  <Link
                    key={opt.value}
                    href={`/products?sort=${opt.value}`}
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
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4">
          {paged.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {page > 1 && (
              <Link href={`/products?sort=${sort}&page=${page - 1}`} className="px-4 py-[8px] border border-border text-chalk-3 text-sm font-medium hover:border-acid hover:text-acid transition-all">
                ← Prev
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/products?sort=${sort}&page=${p}`}
                className={`w-[38px] h-[38px] flex items-center justify-center text-sm font-medium border transition-all ${
                  p === page ? 'border-acid text-acid bg-[rgba(204,255,0,.06)]' : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk-2'
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link href={`/products?sort=${sort}&page=${page + 1}`} className="px-4 py-[8px] border border-border text-chalk-3 text-sm font-medium hover:border-acid hover:text-acid transition-all">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
