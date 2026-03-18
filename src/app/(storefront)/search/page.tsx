import { searchProducts } from '@/lib/api'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'

export const metadata = { title: 'Search — MAISON' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const products = query ? await searchProducts(query) : []

  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-2">
            <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Search
          </div>
          {query ? (
            <>
              <h1 className="text-[28px] font-extrabold text-chalk tracking-[-0.04em] font-display">
                Results for <span className="text-acid">&quot;{query}&quot;</span>
              </h1>
              <p className="text-chalk-3 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            </>
          ) : (
            <h1 className="text-[28px] font-extrabold text-chalk tracking-[-0.04em] font-display">Search Products</h1>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {!query ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-chalk-2 text-lg font-semibold">Enter a search term above</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-chalk-2 text-lg font-semibold mb-2">No results for &quot;{query}&quot;</p>
            <p className="text-chalk-3 text-sm mb-6">Try different keywords or browse our full collection</p>
            <Link href="/products" className="px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
