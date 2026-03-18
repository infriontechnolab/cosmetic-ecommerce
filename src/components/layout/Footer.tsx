import { getFooterData } from '@/lib/api'

export default async function Footer() {
  const footer = await getFooterData()

  return (
    <footer className="bg-void-2 border-t border-border pt-[52px] pb-8 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-border">
          {/* Brand col */}
          <div>
            <div className="text-2xl font-extrabold text-chalk tracking-[-0.5px] font-display">MAISON<span className="text-acid">.</span></div>
            <div className="text-[13px] text-chalk-3 leading-[1.7] mt-3 max-w-[240px]">{footer.tagline}</div>
            <div className="mt-5">
              <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.08em] mb-[10px]">Download Our App</div>
              <button className="inline-flex items-center gap-2 px-4 py-[9px] border-[1.5px] border-border text-[13px] font-semibold text-chalk-2 hover:border-acid hover:text-acid transition-all">
                <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/></svg>
                Get the App
              </button>
            </div>
          </div>
          {/* Link cols */}
          {footer.columns.map(col => (
            <div key={col.title}>
              <div className="text-[12px] font-extrabold text-chalk-2 uppercase tracking-[0.1em] mb-4">{col.title}</div>
              <ul className="flex flex-col gap-[10px]">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-[13px] text-chalk-3 font-medium hover:text-acid transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex items-center justify-between flex-wrap gap-[10px]">
          <div className="text-xs text-chalk-3 font-medium">© 2025 Maison Beauty. All rights reserved.</div>
          <div className="flex gap-5 flex-wrap">
            {footer.bottomLinks.map(link => (
              <a key={link} href="#" className="text-xs text-chalk-3 hover:text-acid transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
