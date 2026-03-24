import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/api'
import ProductImageGallery from './ProductImageGallery'
import ProductCard from '@/components/ui/ProductCard'
import ShadeAndBagClient from './ShadeAndBagClient'
import WishlistButton from './WishlistButton'
import SizeSelectorClient from './_components/SizeSelectorClient'
import ProductTabsClient from './ProductTabsClient'
import ReviewsSection from './_components/ReviewsSection'
import { db } from '@/db'
import { products as productsTable } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getProductReviews } from '@/db/queries/reviews'
import { getProductImages } from '@/db/queries/products'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const products = await getProducts()
  const product = products.find(p => p.id === slug)

  if (!product) notFound()

  const related = products.filter(p => p.id !== product.id).slice(0, 4)

  // Resolve numeric product id for reviews
  const dbProductRows = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), sql`${productsTable.deletedAt} IS NULL`))
    .limit(1)
  const numericProductId = dbProductRows[0]?.id
  const [{ reviews: initialReviews, total: initialTotal }, galleryImages] = await Promise.all([
    numericProductId
      ? getProductReviews(numericProductId, { page: 1 })
      : Promise.resolve({ reviews: [], total: 0 }),
    numericProductId
      ? getProductImages(numericProductId)
      : Promise.resolve([]),
  ])

  const description = product.description ?? 'A luxurious formula crafted with science-backed ingredients to deliver visible results. Suitable for all skin types, this product is dermatologist-tested and free from harmful additives.'
  const ingredients = product.ingredients ?? 'Aqua, Glycerin, Niacinamide (5%), Hyaluronic Acid (3%), Peptide Complex, Ceramides NP, Squalane, Panthenol, Allantoin, Phenoxyethanol.'
  const howToUse = product.howToUse ?? 'Apply 2–3 drops to clean, dry skin. Gently press into face and neck using fingertips. Use morning and evening for best results. Follow with moisturiser and SPF (AM).'

  return (
    <div className="bg-void min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-void-2 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-2 text-xs text-chalk-3">
          <a href="/" className="hover:text-acid transition-colors">Home</a>
          <span>/</span>
          <span className="hover:text-acid transition-colors cursor-pointer">Products</span>
          <span>/</span>
          <span className="text-chalk-2">{product.name}</span>
        </div>
      </div>

      {/* Product hero */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery */}
        <ProductImageGallery
          image={product.image}
          name={product.name}
          bgColor={product.bgColor}
          thumbs={galleryImages.length > 0 ? galleryImages : undefined}
        />

        {/* Info */}
        <div className="flex flex-col">
          <div className="text-[12px] font-bold text-chalk-3 uppercase tracking-[0.1em] mb-2">{product.brand}</div>
          <h1 className="text-[clamp(24px,2.5vw,38px)] font-extrabold text-chalk leading-[1.05] tracking-[-0.04em] font-display uppercase">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1 bg-acid text-void px-[8px] py-[3px] text-xs font-bold">
              <svg className="w-[10px] h-[10px] fill-void" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {product.rating}
            </div>
            <span className="text-sm text-chalk-3">{product.reviews} reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5 pb-5 border-b border-border">
            <span className="text-[28px] font-extrabold text-chalk">{product.price}</span>
            {product.priceWas && <span className="text-lg text-chalk-3 line-through">{product.priceWas}</span>}
            {product.priceOff && <span className="text-sm font-bold text-acid">{product.priceOff}</span>}
          </div>

          {/* Sizes + Shade selector + Add to Bag */}
          {product.sizes && product.sizes.length > 0
            ? <SizeSelectorClient sizes={product.sizes} product={product} />
            : (
              <div className="flex gap-3 mt-6">
                <div className="flex-1 flex flex-col">
                  <ShadeAndBagClient product={product} />
                </div>
                <WishlistButton product={product} />
              </div>
            )
          }

          {/* Trust signals */}
          <div className="mt-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-chalk-3">
              <svg className="w-4 h-4 stroke-acid flex-shrink-0" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
              Free 30-day returns
            </div>
            <div className="flex items-center gap-2 text-xs text-chalk-3">
              <svg className="w-4 h-4 stroke-acid flex-shrink-0" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              100% authentic — dermatologist tested
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-border">
        <div className="max-w-[1440px] mx-auto px-6">
          <ProductTabsClient description={description} ingredients={ingredients} howToUse={howToUse} />
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection
        productSlug={slug}
        initialReviews={initialReviews.map(r => ({
          ...r,
          createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        }))}
        initialTotal={initialTotal}
        avgRating={typeof product.rating === 'number' ? product.rating : Number(product.rating) || 0}
      />

      {/* You may also like */}
      <div className="max-w-[1440px] mx-auto px-6 py-12 border-t border-border">
        <h2 className="text-[20px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-6">You May <span className="text-acid">Also Like</span></h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {related.map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      </div>
    </div>
  )
}
