'use client'
import { useState } from 'react'

const TABS = ['DESCRIPTION', 'INGREDIENTS', 'HOW TO USE']

interface Props {
  description: string
  ingredients: string
  howToUse: string
}

export default function ProductTabsClient({ description, ingredients, howToUse }: Props) {
  const [active, setActive] = useState(0)
  const content = [description, ingredients, howToUse]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`px-6 py-4 text-[13px] font-bold uppercase tracking-[0.06em] border-b-2 transition-all -mb-px ${
              active === i
                ? 'border-acid text-acid'
                : 'border-transparent text-chalk-3 hover:text-chalk-2'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="py-6 max-w-[700px]" style={{ animation: 'slideIn .25s ease both' }}>
        <p className="text-[15px] text-chalk-2 leading-[1.8]">{content[active]}</p>
      </div>
    </div>
  )
}
