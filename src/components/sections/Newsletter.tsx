export default function Newsletter() {
  return (
    <section className="bg-void-3 py-[72px] px-6 text-center border-t border-border">
      <div className="max-w-[580px] mx-auto">
        <div className="inline-flex items-center gap-[7px] bg-void-2 border border-border text-chalk-3 px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase mb-4">
          ✉ Stay Connected
        </div>
        <h2 className="text-[34px] font-extrabold text-chalk tracking-[-0.04em] leading-[1.1] font-display uppercase">
          Be the first to hear<br />about <span className="text-acid">Maison</span>
        </h2>
        <p className="text-[15px] text-chalk-2 leading-[1.7] mt-[14px] mb-7 max-w-[440px] mx-auto">
          Exclusive launches, expert tips, and beauty offers — delivered straight to your inbox. No spam, ever.
        </p>
        <div className="flex gap-[10px]">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-[14px] bg-void border border-border font-sans text-sm text-chalk outline-none placeholder:text-chalk-3 focus:border-acid transition-all"
          />
          <button className="px-7 py-[14px] bg-acid text-void text-sm font-bold flex-shrink-0 hover:bg-acid-dim transition-colors whitespace-nowrap uppercase tracking-[0.04em]">Subscribe</button>
        </div>
        <div className="text-xs text-chalk-3 mt-[14px]">By subscribing you agree to our Privacy Policy. Unsubscribe anytime.</div>
      </div>
    </section>
  )
}
