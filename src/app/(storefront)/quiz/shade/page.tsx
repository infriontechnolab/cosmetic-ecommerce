'use client'
import { useState } from 'react'
import Link from 'next/link'

interface QuizStep {
  q: string
  options: { label: string; value: string; emoji: string }[]
}

const STEPS: QuizStep[] = [
  {
    q: 'What is your skin tone?',
    options: [
      { label: 'Fair', value: 'fair', emoji: '🏻' },
      { label: 'Light', value: 'light', emoji: '🏼' },
      { label: 'Medium', value: 'medium', emoji: '🏽' },
      { label: 'Tan', value: 'tan', emoji: '🏾' },
      { label: 'Deep', value: 'deep', emoji: '🏿' },
    ]
  },
  {
    q: 'What is your skin undertone?',
    options: [
      { label: 'Cool (pink/red)', value: 'cool', emoji: '❄️' },
      { label: 'Warm (yellow/golden)', value: 'warm', emoji: '☀️' },
      { label: 'Neutral', value: 'neutral', emoji: '⚖️' },
      { label: 'Olive', value: 'olive', emoji: '🌿' },
    ]
  },
  {
    q: 'What finish do you prefer?',
    options: [
      { label: 'Matte', value: 'matte', emoji: '🌫️' },
      { label: 'Satin', value: 'satin', emoji: '✨' },
      { label: 'Dewy / Glossy', value: 'dewy', emoji: '💧' },
      { label: 'Natural', value: 'natural', emoji: '🍃' },
    ]
  },
]

const RECOMMENDATIONS = [
  { name: 'Velvet Matte Foundation', brand: 'Fenty Beauty', match: '98%', shade: '#C68642' },
  { name: 'Luminos Skin Tint', brand: 'Charlotte Tilbury', match: '95%', shade: '#D4A76A' },
  { name: "Pro Filt'r Soft Matte", brand: 'NYX', match: '91%', shade: '#E8C49A' },
]

export default function ShadeQuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState(false)

  function selectOption(value: string) {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      setDone(true)
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
          {!done ? (
            <>
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
                    className="flex flex-col items-center gap-2 p-5 bg-surface border border-border hover:border-acid hover:bg-[rgba(204,255,0,.06)] transition-all group"
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-sm font-semibold text-chalk-2 group-hover:text-acid transition-colors">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="text-5xl mb-4">🎉</div>
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
