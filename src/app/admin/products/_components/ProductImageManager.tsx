'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { addProductImageAction, setProductImagePrimaryAction, removeProductImageAction } from '@/lib/admin-actions'
import type { AdminProductImage } from '@/db/queries/admin-products'

interface Props {
  productId: number
  initialImages: AdminProductImage[]
}

export default function ProductImageManager({ productId, initialImages }: Props) {
  const [images, setImages] = useState<AdminProductImage[]>(initialImages)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [makePrimary, setMakePrimary] = useState(images.length === 0)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!url.trim()) return
    setError('')
    startTransition(async () => {
      try {
        await addProductImageAction(productId, url.trim(), alt.trim(), makePrimary || images.length === 0)
        // Optimistic update — server will revalidate
        const newImg: AdminProductImage = {
          id: Date.now(), // temp id replaced on refresh
          imageUrl: url.trim(),
          thumbnailUrl: null,
          altText: alt.trim() || null,
          displayOrder: images.length,
          isPrimary: makePrimary || images.length === 0,
        }
        setImages(prev => {
          const updated = makePrimary || prev.length === 0
            ? prev.map(i => ({ ...i, isPrimary: false }))
            : prev
          return [...updated, newImg]
        })
        setUrl('')
        setAlt('')
        setMakePrimary(false)
      } catch {
        setError('Failed to add image')
      }
    })
  }

  function handleSetPrimary(imageId: number) {
    startTransition(async () => {
      await setProductImagePrimaryAction(productId, imageId)
      setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === imageId })))
    })
  }

  function handleRemove(imageId: number) {
    startTransition(async () => {
      await removeProductImageAction(productId, imageId)
      setImages(prev => prev.filter(i => i.id !== imageId))
    })
  }

  return (
    <div className="mt-8 border-t border-border pt-8">
      <h2 className="text-sm font-bold text-chalk uppercase tracking-wider mb-4">Product Images</h2>

      {/* Current images grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {images.map(img => (
            <div key={img.id} className={`border ${img.isPrimary ? 'border-acid' : 'border-border'} bg-surface relative group`}>
              <div className="aspect-square relative overflow-hidden bg-void">
                <Image
                  src={img.imageUrl}
                  alt={img.altText ?? 'Product image'}
                  fill
                  className="object-contain p-2"
                  sizes="200px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 bg-acid text-void text-[9px] font-bold uppercase px-1.5 py-0.5 tracking-wide">
                  Primary
                </div>
              )}
              <div className="p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={isPending}
                    className="flex-1 text-[10px] font-semibold text-acid border border-acid/30 hover:bg-acid/10 py-1 transition-colors disabled:opacity-50"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => handleRemove(img.id)}
                  disabled={isPending}
                  className="flex-1 text-[10px] font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 py-1 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              {img.altText && (
                <p className="px-2 pb-2 text-[10px] text-chalk-3 truncate">{img.altText}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border bg-surface p-8 text-center mb-6">
          <p className="text-sm text-chalk-3">No images yet. Add one below.</p>
        </div>
      )}

      {/* Add image form */}
      <div className="bg-surface border border-border p-4">
        <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Add Image URL</p>
        <div className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full px-3 py-[9px] bg-void border border-border text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Alt text (optional)"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              className="flex-1 px-3 py-[9px] bg-void border border-border text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
            />
            <label className="flex items-center gap-2 text-xs text-chalk-3 px-3 border border-border cursor-pointer hover:border-border-hi transition-colors whitespace-nowrap">
              <input
                type="checkbox"
                checked={makePrimary}
                onChange={e => setMakePrimary(e.target.checked)}
                className="accent-acid"
              />
              Set as primary
            </label>
            <button
              onClick={handleAdd}
              disabled={isPending || !url.trim()}
              className="px-5 py-[9px] bg-acid text-void text-xs font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}
