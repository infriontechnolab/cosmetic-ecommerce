'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  image: string
  name: string
  bgColor: string
  thumbs?: string[]
}

export default function ProductImageGallery({ image, name, bgColor, thumbs }: Props) {
  const [active, setActive] = useState(0)
  const images = thumbs && thumbs.length > 0 ? thumbs : [image]

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square border overflow-hidden transition-all ${active === i ? 'border-acid' : 'border-border hover:border-border-hi'}`}
              style={{ background: bgColor }}
            >
              <Image src={src} alt={`${name} ${i + 1}`} width={72} height={72} className="object-contain p-2 w-full h-full" />
            </button>
          ))}
        </div>
      )}
      {/* Main image */}
      <div className="flex-1 relative aspect-square border border-border overflow-hidden" style={{ background: bgColor }}>
        <Image
          src={images[active]}
          alt={name}
          fill
          className="object-contain p-8"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  )
}
