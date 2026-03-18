'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[800px] mx-auto px-6 py-16">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-6">
          <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Contact
        </div>
        <h1 className="text-[clamp(32px,4vw,56px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">
          Contact <span className="text-acid">Us</span>
        </h1>
        <p className="text-chalk-3 text-sm mb-10">We&apos;d love to hear from you. Our team replies within 24 hours.</p>

        {sent ? (
          <div className="bg-surface border border-acid p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-lg font-bold text-chalk mb-1">Message Sent!</h2>
            <p className="text-chalk-3 text-sm">We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border p-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@email.com"
                  className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Order inquiry, product question…"
                  className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us how we can help…"
                  className="w-full bg-void border border-border px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors resize-none"
                />
              </div>
            </div>
            <button
              onClick={() => { if (form.name && form.email && form.message) setSent(true) }}
              className="mt-5 px-8 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
            >
              Send Message →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
