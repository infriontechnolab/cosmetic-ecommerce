import Link from 'next/link'

export const metadata = { title: 'About — MAISON' }

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[900px] mx-auto px-6 py-16">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-6">
          <Link href="/" className="hover:text-acid transition-colors">Home</Link> / About
        </div>
        <h1 className="text-[clamp(36px,5vw,64px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase leading-[1.0] mb-8">
          About <span className="text-acid">MAISON</span>
        </h1>
        <div className="space-y-6 text-chalk-2 text-[15px] leading-[1.7]">
          <p>MAISON is a curated luxury beauty destination where science meets artistry. We believe that beauty is personal, powerful, and transformative — and that every person deserves access to the world&apos;s finest formulas.</p>
          <p>Founded with a passion for skin-first beauty, we bring together 2000+ luxury brands, expert curation, and a commitment to inclusivity. From cult-favourite serums to the latest shade innovations, our collection is thoughtfully assembled for every skin tone, type, and preference.</p>
          <div className="grid grid-cols-3 gap-4 my-10">
            {[
              { stat: '2000+', label: 'Luxury Brands' },
              { stat: '50K+', label: 'Happy Customers' },
              { stat: '4.8★', label: 'Average Rating' },
            ].map(card => (
              <div key={card.stat} className="bg-surface border border-border p-6 text-center">
                <div className="text-[32px] font-extrabold text-acid font-display">{card.stat}</div>
                <div className="text-sm text-chalk-3 mt-1">{card.label}</div>
              </div>
            ))}
          </div>
          <p>Our team of beauty experts, dermatologists, and makeup artists curate every product that earns a place on our shelves. We test, verify, and vouch for what we sell.</p>
        </div>
        <div className="mt-10">
          <Link href="/products" className="px-8 py-4 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
            Shop Our Collection
          </Link>
        </div>
      </div>
    </div>
  )
}
