import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDiscount } from '@/db/queries/admin-discounts'
import { updateDiscountAction, deleteDiscountAction } from '@/lib/discount-actions'
import DiscountForm from '../../_components/DiscountForm'

export const metadata = { title: 'Edit Coupon — Admin' }

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const discount = await getDiscount(Number(id))
  if (!discount) notFound()

  async function update(formData: FormData) {
    'use server'
    await updateDiscountAction(discount!.id, formData)
  }

  async function del() {
    'use server'
    await deleteDiscountAction(discount!.id)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="text-xs text-chalk-3 mb-2">
          <Link href="/admin" className="hover:text-chalk">Admin</Link>
          {' / '}
          <Link href="/admin/discounts" className="hover:text-chalk">Coupons</Link>
          {' / '}Edit
        </div>
        <h1 className="text-2xl font-extrabold text-chalk tracking-tight font-mono">{discount.code}</h1>
        <p className="text-xs text-chalk-3 mt-1">
          Used {discount.timesUsed ?? 0} time{(discount.timesUsed ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-surface border border-border p-6">
        <DiscountForm action={update} discount={discount} deleteAction={del} />
      </div>
    </div>
  )
}
