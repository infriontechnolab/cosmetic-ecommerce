import { getLoyaltyData } from '@/lib/api'

export default async function LoyaltyRewards() {
  const loyalty = await getLoyaltyData()
  const progress = Math.round((loyalty.points / loyalty.tierNextPoints) * 100)
  const pointsToNext = loyalty.tierNextPoints - loyalty.points

  return (
    <section className="bg-void-2 pb-[52px]">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="bg-surface border border-border px-7 py-5 flex items-center gap-6 flex-wrap">
          <div className="text-acid text-2xl">◆</div>
          <div>
            <div className="text-sm font-bold text-chalk">{loyalty.points} Maison Points</div>
            <div className="text-xs text-chalk-3 mt-0.5">{pointsToNext} points to {loyalty.tierNext} tier</div>
          </div>
          <div className="flex-1 max-w-[240px]">
            <div className="h-[4px] bg-border overflow-hidden">
              <div className="h-full bg-acid transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-chalk-3 mt-1 font-semibold uppercase tracking-[0.04em]">
              <span>{loyalty.tierCurrent} ({loyalty.tierCurrentPoints})</span>
              <span>{loyalty.tierNext} ({loyalty.tierNextPoints})</span>
            </div>
          </div>
          <button className="px-6 py-[10px] bg-acid text-void text-[13px] font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">Redeem Rewards</button>
        </div>
      </div>
    </section>
  )
}
