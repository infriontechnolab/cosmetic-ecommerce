'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface QuizStep {
  q: string
  options: { label: string; value: string; icon: React.ReactNode }[]
}

const STEPS: QuizStep[] = [
  {
    q: 'What is your skin type?',
    options: [
      { label: 'Dry', value: 'dry', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><circle cx="12" cy="12" r="5" strokeLinecap="round"/><line x1="12" y1="2" x2="12" y2="4.5" strokeLinecap="round"/><line x1="12" y1="19.5" x2="12" y2="22" strokeLinecap="round"/><line x1="2" y1="12" x2="4.5" y2="12" strokeLinecap="round"/><line x1="19.5" y1="12" x2="22" y2="12" strokeLinecap="round"/><line x1="4.93" y1="4.93" x2="6.64" y2="6.64" strokeLinecap="round"/><line x1="17.36" y1="17.36" x2="19.07" y2="19.07" strokeLinecap="round"/><line x1="19.07" y1="4.93" x2="17.36" y2="6.64" strokeLinecap="round"/><line x1="6.64" y1="17.36" x2="4.93" y2="19.07" strokeLinecap="round"/></svg> },
      { label: 'Oily', value: 'oily', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z"/><path strokeLinecap="round" d="M9 16c.5 2 2 3 3 3"/></svg> },
      { label: 'Combination', value: 'combination', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><circle cx="12" cy="12" r="8" strokeLinecap="round"/><line x1="12" y1="4" x2="12" y2="20" strokeLinecap="round"/><path strokeLinecap="round" d="M12 4C8.69 4 6 7.58 6 12C6 16.42 8.69 20 12 20" fill="currentColor" fillOpacity="0.15"/></svg> },
      { label: 'Normal', value: 'normal', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19C12 19 8 16 8 12C8 9.5 10 8 12 7C14 8 16 9.5 16 12C16 16 12 19 12 19Z"/><path strokeLinecap="round" d="M8 12C8 12 4 11 3.5 8C5.5 7 8 8.5 8 12"/><path strokeLinecap="round" d="M16 12C16 12 20 11 20.5 8C18.5 7 16 8.5 16 12"/></svg> },
    ]
  },
  {
    q: 'What is your primary skin concern?',
    options: [
      { label: 'Hydration', value: 'hydration', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C12 3 5 10 5 15a7 7 0 0014 0C19 10 12 3 12 3z"/><path strokeLinecap="round" d="M9 16c.5 2 2 3 3 3"/></svg> },
      { label: 'Acne Control', value: 'acne', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19C12 19 8 16 8 12C8 9.5 10 8 12 7C14 8 16 9.5 16 12C16 16 12 19 12 19Z"/><path strokeLinecap="round" d="M8 12C8 12 4 11 3.5 8C5.5 7 8 8.5 8 12"/><path strokeLinecap="round" d="M16 12C16 12 20 11 20.5 8C18.5 7 16 8.5 16 12"/></svg> },
      { label: 'Anti-Aging', value: 'anti-aging', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" d="M6 2H18"/><path strokeLinecap="round" d="M6 22H18"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 2C8 2 7 8 12 12C17 8 16 2 16 2"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 22C8 22 7 16 12 12C17 16 16 22 16 22"/></svg> },
      { label: 'Brightening', value: 'brightening', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><circle cx="12" cy="12" r="4" strokeLinecap="round"/><line x1="12" y1="2" x2="12" y2="5" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round"/><line x1="2" y1="12" x2="5" y2="12" strokeLinecap="round"/><line x1="19" y1="12" x2="22" y2="12" strokeLinecap="round"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05" strokeLinecap="round"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07" strokeLinecap="round"/><line x1="19.07" y1="4.93" x2="16.95" y2="7.05" strokeLinecap="round"/><line x1="7.05" y1="16.95" x2="4.93" y2="19.07" strokeLinecap="round"/></svg> },
      { label: 'Pore Minimising', value: 'pores', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><circle cx="11" cy="11" r="7" strokeLinecap="round"/><line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round"/><circle cx="8.5" cy="9.5" r="1.2" strokeLinecap="round"/><circle cx="13" cy="9" r="0.9" strokeLinecap="round"/><circle cx="10" cy="13" r="1" strokeLinecap="round"/></svg> },
    ]
  },
  {
    q: 'What is your skin tone?',
    options: [
      { label: 'Fair', value: 'fair', icon: <span className="w-7 h-7 rounded-full border border-border-hi inline-block" style={{ background: '#FDDBB4' }} /> },
      { label: 'Light', value: 'light', icon: <span className="w-7 h-7 rounded-full border border-border-hi inline-block" style={{ background: '#EAC086' }} /> },
      { label: 'Medium', value: 'medium', icon: <span className="w-7 h-7 rounded-full border border-border-hi inline-block" style={{ background: '#D4956A' }} /> },
      { label: 'Tan', value: 'tan', icon: <span className="w-7 h-7 rounded-full border border-border-hi inline-block" style={{ background: '#C07850' }} /> },
      { label: 'Deep', value: 'deep', icon: <span className="w-7 h-7 rounded-full border border-border-hi inline-block" style={{ background: '#7D4025' }} /> },
    ]
  },
  {
    q: 'What is your skin undertone?',
    options: [
      { label: 'Cool (pink/red)', value: 'cool', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><line x1="12" y1="2" x2="12" y2="22" strokeLinecap="round"/><line x1="2" y1="12" x2="22" y2="12" strokeLinecap="round"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" strokeLinecap="round"/><circle cx="12" cy="12" r="2.5" strokeLinecap="round"/></svg> },
      { label: 'Warm (yellow/golden)', value: 'warm', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><circle cx="12" cy="12" r="4.5" strokeLinecap="round"/><line x1="12" y1="2" x2="12" y2="4.5" strokeLinecap="round"/><line x1="12" y1="19.5" x2="12" y2="22" strokeLinecap="round"/><line x1="2" y1="12" x2="4.5" y2="12" strokeLinecap="round"/><line x1="19.5" y1="12" x2="22" y2="12" strokeLinecap="round"/><line x1="4.93" y1="4.93" x2="6.64" y2="6.64" strokeLinecap="round"/><line x1="17.36" y1="17.36" x2="19.07" y2="19.07" strokeLinecap="round"/><line x1="19.07" y1="4.93" x2="17.36" y2="6.64" strokeLinecap="round"/><line x1="6.64" y1="17.36" x2="4.93" y2="19.07" strokeLinecap="round"/></svg> },
      { label: 'Neutral', value: 'neutral', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/><path strokeLinecap="round" d="M7 12L5 8L3 12L5 16L7 12"/><path strokeLinecap="round" d="M17 12L19 8L21 12L19 16L17 12"/><line x1="12" y1="4" x2="12" y2="20" strokeLinecap="round" strokeOpacity="0.4"/></svg> },
      { label: 'Olive', value: 'olive', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19C12 19 8 16 8 12C8 9.5 10 8 12 7C14 8 16 9.5 16 12C16 16 12 19 12 19Z"/><path strokeLinecap="round" d="M8 12C8 12 4 11 3.5 8C5.5 7 8 8.5 8 12"/><path strokeLinecap="round" d="M16 12C16 12 20 11 20.5 8C18.5 7 16 8.5 16 12"/><path strokeLinecap="round" d="M12 19 Q12 21.5 11 22.5"/></svg> },
    ]
  },
  {
    q: 'What finish do you prefer?',
    options: [
      { label: 'Matte', value: 'matte', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><rect x="4" y="4" width="16" height="16" rx="1" strokeLinecap="round"/><line x1="4" y1="10" x2="20" y2="10" strokeLinecap="round" strokeOpacity="0.4"/><line x1="4" y1="14" x2="20" y2="14" strokeLinecap="round" strokeOpacity="0.4"/></svg> },
      { label: 'Satin', value: 'satin', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" d="M3 12 Q6 6 12 12 Q18 18 21 12"/><path strokeLinecap="round" d="M3 8 Q6 2 12 8 Q18 14 21 8" strokeOpacity="0.35"/><path strokeLinecap="round" d="M3 16 Q6 10 12 16 Q18 22 21 16" strokeOpacity="0.35"/></svg> },
      { label: 'Dewy / Glossy', value: 'dewy', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" d="M12 4C12 4 7 9 7 13a5 5 0 0010 0C17 9 12 4 12 4z"/><path strokeLinecap="round" d="M10 15c.3 1.2 1.3 2 2 2"/><circle cx="17" cy="6" r="1.5" strokeLinecap="round"/><circle cx="19" cy="10" r="1" strokeLinecap="round"/></svg> },
      { label: 'Natural', value: 'natural', icon: <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19C12 19 8 16 8 12C8 9.5 10 8 12 7C14 8 16 9.5 16 12C16 16 12 19 12 19Z"/><path strokeLinecap="round" d="M12 19 Q12 21.5 11.5 22.5"/><path strokeLinecap="round" d="M12 21 Q14 20 15 21.5"/></svg> },
    ]
  },
]

const RECOMMENDATIONS = [
  { name: 'Velvet Matte Foundation', brand: 'Fenty Beauty', match: '98%', shade: '#C68642' },
  { name: 'Luminos Skin Tint', brand: 'Charlotte Tilbury', match: '95%', shade: '#D4A76A' },
  { name: "Pro Filt'r Soft Matte", brand: 'NYX', match: '91%', shade: '#E8C49A' },
]

export default function ShadeQuizPage() {
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [checkingPrevious, setCheckingPrevious] = useState(true)
  const [hasPrevious, setHasPrevious] = useState(false)

  useEffect(() => {
    fetch('/api/quiz/result')
      .then(res => {
        if (res.ok) setHasPrevious(true)
      })
      .catch(() => {})
      .finally(() => setCheckingPrevious(false))
  }, [])

  function selectOption(value: string) {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      setDone(true)
      if (session?.user) {
        fetch('/api/quiz/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skinType: newAnswers[0],
            primaryConcern: newAnswers[1],
            undertone: newAnswers[3],
          }),
        }).catch(() => {})
      }
    }
  }

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="border-b border-border">
        <div className="max-w-[800px] mx-auto px-6 py-6">
          <Link href="/" className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] hover:text-acid transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[600px]">
          {checkingPrevious ? (
            <div className="text-xs text-chalk-3 text-center py-4">Loading your profile...</div>
          ) : !done ? (
            <>
              {hasPrevious && (
                <div className="mb-6 p-4 bg-surface border border-acid/30 flex items-center justify-between gap-4">
                  <p className="text-sm text-chalk-2">You&apos;ve taken this quiz before.</p>
                  <button onClick={() => setHasPrevious(false)} className="text-xs font-bold text-acid uppercase tracking-[0.06em] hover:opacity-80 transition-opacity">Retake Quiz</button>
                </div>
              )}
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 transition-all ${i <= currentStep ? 'bg-acid' : 'bg-border'}`} />
                ))}
              </div>
              <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-3">
                Step {currentStep + 1} of {STEPS.length}
              </div>
              <h2 className="text-[clamp(24px,4vw,40px)] font-extrabold text-chalk tracking-[-0.04em] font-display mb-8">
                {STEPS[currentStep].q}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {STEPS[currentStep].options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => selectOption(opt.value)}
                    className="flex flex-col items-center gap-2 p-5 bg-surface border border-border hover:border-acid hover:bg-[rgba(140,90,60,0.06)] transition-all group"
                  >
                    <span style={{ color: 'var(--color-terracotta)' }}>{opt.icon}</span>
                    <span className="text-sm font-semibold text-chalk-2 group-hover:text-acid transition-colors">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 4L12 14.01l-3-3"/></svg>
                </div>
                <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">
                  Your <span className="text-acid">Matches</span>
                </h2>
                <p className="text-chalk-3 text-sm">Based on your answers, these shades are perfect for you</p>
              </div>
              <div className="flex flex-col gap-4 mb-8">
                {RECOMMENDATIONS.map((rec, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface border border-border p-4 hover:border-acid transition-all">
                    <div className="w-10 h-10 flex-shrink-0 border border-border" style={{ background: rec.shade }} />
                    <div className="flex-1">
                      <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.08em]">{rec.brand}</div>
                      <div className="text-sm font-bold text-chalk">{rec.name}</div>
                    </div>
                    <div className="text-sm font-extrabold text-acid">{rec.match}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/products" className="flex-1 py-3 bg-acid text-void text-sm font-bold text-center hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]">
                  Shop Matches
                </Link>
                <button
                  onClick={() => { setCurrentStep(0); setAnswers([]); setDone(false) }}
                  className="flex-1 py-3 border border-border text-chalk-2 text-sm font-semibold hover:border-acid hover:text-acid transition-all uppercase"
                >
                  Retake Quiz
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
