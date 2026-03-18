import { getTrustItems } from '@/lib/api'
import type { ReactNode } from 'react'

const ICONS: Record<string, ReactNode> = {
  delivery: <svg fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  returns:  <svg fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>,
  authentic:<svg fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  payment:  <svg fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  curated:  <svg fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
}

export default async function TrustBar() {
  const items = await getTrustItems()

  return (
    <div className="border-t border-b border-border bg-void-2">
      <div className="max-w-[1440px] mx-auto px-6 flex items-stretch">
        {items.map((item, i) => (
          <div key={item.title} className={`flex-1 flex items-center gap-3 py-[18px] px-6 ${i < items.length - 1 ? 'border-r border-border' : ''}`}>
            <div className="w-9 h-9 border border-border-hi flex items-center justify-center flex-shrink-0">
              <span className="[&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-acid">{ICONS[item.iconKey]}</span>
            </div>
            <div>
              <div className="text-[13px] font-bold text-chalk">{item.title}</div>
              <div className="text-xs text-chalk-3 mt-px">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
