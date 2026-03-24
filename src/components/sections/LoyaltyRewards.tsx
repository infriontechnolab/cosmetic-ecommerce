import Link from 'next/link'
import { auth } from '@/auth'
import { getLoyaltyData } from '@/lib/api'

const TIERS = [
  { name: 'Pearl',    points: 0,    perk: 'Free returns · Welcome gift' },
  { name: 'Gold',     points: 400,  perk: 'Priority support · 10% bonus points' },
  { name: 'Platinum', points: 1000, perk: 'Free express delivery · Early access' },
  { name: 'Diamond',  points: 2500, perk: 'Personal stylist · VIP events' },
]

export default async function LoyaltyRewards() {
  const session = await auth()
  const loyalty = session ? await getLoyaltyData() : null

  if (!session || !loyalty) {
    return (
      <section className="py-[72px]" style={{ background: 'var(--color-deep-wine)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left — pitch */}
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-3"
                style={{ color: 'var(--color-terracotta)' }}
              >
                The Maison Circle
              </p>
              <h2 className="font-display font-light text-[42px] sm:text-[52px] leading-[1.08] text-white mb-5">
                Earn points.<br />Unlock perks.<br /><em className="italic" style={{ color: 'rgba(255,255,255,0.6)' }}>Get rewarded.</em>
              </h2>
              <p className="text-sm leading-relaxed max-w-[420px] mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Join free and earn 1 point for every ₹100 spent. Redeem for discounts, gifts, and exclusive access.
              </p>

              {/* Benefit chips */}
              <div className="flex flex-wrap gap-2.5 mb-10">
                {[
                  'Earn on every order',
                  'Redeem for discounts',
                  'Birthday bonus gift',
                  'Early launch access',
                ].map((benefit) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                    style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}
                  >
                    <span style={{ color: 'var(--color-terracotta)', fontSize: 10 }}>◆</span>
                    {benefit}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/sign-up"
                  className="px-6 py-[12px] text-[13px] font-bold uppercase tracking-[0.04em] hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--color-terracotta)', color: 'var(--color-ivory)' }}
                >
                  Join Maison Rewards →
                </Link>
                <Link
                  href="/sign-in"
                  className="px-6 py-[11px] text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.75)' }}
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right — tier cards */}
            <div className="grid grid-cols-2 gap-3">
              {TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className="p-5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div className="font-display font-light text-white text-[22px] leading-none mb-1.5">
                    {tier.name}
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-terracotta)' }}>
                    {tier.points === 0 ? 'Free to join' : `${tier.points}+ pts`}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {tier.perk}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    )
  }

  // Authenticated dashboard
  const progress = Math.round(
    ((loyalty.points - loyalty.tierCurrentPoints) /
      (loyalty.tierNextPoints - loyalty.tierCurrentPoints)) *
      100
  )
  const pointsToNext = loyalty.tierNextPoints - loyalty.points
  const firstName = session.user?.name?.split(' ')[0] ?? 'there'

  return (
    <section className="bg-void-2 pb-[52px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="bg-surface border border-border px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">

          {/* Zone 1 — Identity */}
          <div className="shrink-0">
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-chalk-3 mb-2">The Maison Circle</p>
            <div className="text-chalk font-bold text-sm mb-1">Hi, {firstName}</div>
            <div className="font-display font-light text-[48px] leading-none text-chalk">
              {loyalty.points}
            </div>
            <div className="text-chalk-3 text-[11px] mt-0.5 mb-2">points</div>
            <span className="inline-block px-2.5 py-0.5 border border-acid text-acid text-[11px] font-bold uppercase tracking-[0.06em]">
              {loyalty.tierCurrent}
            </span>
          </div>

          <div className="hidden sm:block w-px self-stretch bg-border shrink-0" />

          {/* Zone 2 — Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.04em] mb-2">
              <span className="text-chalk">{loyalty.tierCurrent}</span>
              <span className="text-chalk-3">{loyalty.tierNext}</span>
            </div>
            <div className="h-[6px] bg-border overflow-hidden">
              <div
                className="h-full bg-acid transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-chalk-3 mt-1">
              <span>{loyalty.tierCurrentPoints} pts</span>
              <span>{loyalty.tierNextPoints} pts</span>
            </div>
            <div className="text-xs text-chalk-3 mt-2">
              <span className="text-chalk font-semibold">{pointsToNext} points</span> to {loyalty.tierNext}
            </div>
          </div>

          <div className="hidden sm:block w-px self-stretch bg-border shrink-0" />

          {/* Zone 3 — Perks + CTA */}
          <div className="shrink-0 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><rect x="4" y="11" width="16" height="10" rx="0.5" strokeLinecap="round"/><rect x="3" y="8" width="18" height="3" rx="0.5" strokeLinecap="round"/><line x1="12" y1="8" x2="12" y2="21" strokeLinecap="round"/><path strokeLinecap="round" d="M12 8 C10 5 7 5.5 7 7.5 C7 8.5 9 9 12 8"/><path strokeLinecap="round" d="M12 8 C14 5 17 5.5 17 7.5 C17 8.5 15 9 12 8"/></svg>, label: 'Earn on orders' },
                { icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>, label: 'Redeem discounts' },
                { icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, label: 'Birthday bonus' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-chalk-3">
                  <span style={{ color: 'var(--color-terracotta)' }}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <Link href="/account" className="px-6 py-[10px] bg-acid text-void text-[13px] font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
              Redeem Rewards
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
