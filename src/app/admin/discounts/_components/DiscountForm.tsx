'use client'

import { useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { DiscountListItem } from '@/db/queries/admin-discounts'

interface DiscountFormProps {
  action: (formData: FormData) => Promise<void>
  discount?: DiscountListItem
  deleteAction?: () => Promise<void>
}

function toDatetimeLocal(d: Date | null | undefined) {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function DiscountForm({ action, discount, deleteAction }: DiscountFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>(
    discount?.discountType ?? 'percentage'
  )
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => action(formData))
  }

  function handleDelete() {
    if (!deleteAction) return
    if (!confirm('Delete this coupon? This cannot be undone.')) return
    startDelete(() => deleteAction())
  }

  const field = 'bg-void border border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid w-full h-9 px-3 text-sm'
  const labelCls = 'text-xs font-semibold text-chalk-3 uppercase tracking-wider'

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

      {/* Code + Active */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Coupon Code *</Label>
          <Input
            name="code"
            required
            defaultValue={discount?.code}
            placeholder="e.g. WELCOME20"
            className={field}
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Status</Label>
          <select
            name="isActive"
            defaultValue={discount ? (discount.isActive ? 'true' : 'false') : 'true'}
            className={`${field} bg-void`}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className={labelCls}>Description</Label>
        <Textarea
          name="description"
          defaultValue={discount?.description ?? ''}
          placeholder="Internal note (not shown to customers)"
          className="bg-void border border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid resize-none text-sm"
          rows={2}
        />
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Discount Type *</Label>
          <select
            name="discountType"
            value={discountType}
            onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed_amount')}
            className={`${field} bg-void`}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount (₹)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>
            {discountType === 'percentage' ? 'Discount % *' : 'Discount Amount (₹) *'}
          </Label>
          <Input
            name="discountValue"
            type="number"
            required
            min={0.01}
            step={0.01}
            max={discountType === 'percentage' ? 100 : undefined}
            defaultValue={discount?.discountValue}
            placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
            className={field}
          />
        </div>
      </div>

      {/* Min order + Max discount (only for %) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Min Order Value (₹)</Label>
          <Input
            name="minOrderValue"
            type="number"
            min={0}
            step={0.01}
            defaultValue={discount?.minOrderValue ?? ''}
            placeholder="e.g. 999"
            className={field}
          />
        </div>
        {discountType === 'percentage' && (
          <div className="space-y-1.5">
            <Label className={labelCls}>Max Discount Cap (₹)</Label>
            <Input
              name="maxDiscountAmount"
              type="number"
              min={0}
              step={0.01}
              defaultValue={discount?.maxDiscountAmount ?? ''}
              placeholder="e.g. 1000"
              className={field}
            />
          </div>
        )}
      </div>

      {/* Usage limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Total Usage Limit</Label>
          <Input
            name="usageLimit"
            type="number"
            min={1}
            defaultValue={discount?.usageLimit ?? ''}
            placeholder="Leave blank for unlimited"
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Per-User Limit</Label>
          <Input
            name="usageLimitPerUser"
            type="number"
            min={1}
            defaultValue={discount?.usageLimitPerUser ?? 1}
            className={field}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Valid From *</Label>
          <Input
            name="validFrom"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(discount?.validFrom)}
            className={field}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelCls}>Valid Until *</Label>
          <Input
            name="validUntil"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(discount?.validUntil)}
            className={field}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-none bg-acid text-void hover:bg-acid/90 font-bold h-9 px-6"
        >
          {isPending ? 'Saving…' : discount ? 'Save Changes' : 'Create Coupon'}
        </Button>
        {deleteAction && (
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
            className="rounded-none border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 px-4"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        )}
      </div>
    </form>
  )
}
