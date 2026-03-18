import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import { getProducts } from '@/lib/api'

export default async function EditorsPicks() {
  const products = await getProducts()

  return (
    <section className="py-[52px] bg-void-2">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-[22px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase">{"Editor's"} <span className="text-acid">Picks</span></h2>
          <Link href="/products" className="flex items-center gap-[6px] text-[13px] font-semibold text-acid hover:gap-[10px] transition-all uppercase tracking-[0.04em]">
            View All <svg className="w-[14px] h-[14px] stroke-acid" fill="none" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
