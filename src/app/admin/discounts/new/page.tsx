import Link from 'next/link'
import { createDiscountAction } from '@/lib/discount-actions'
import DiscountForm from '../_components/DiscountForm'

export const metadata = { title: 'New Coupon — Admin' }

export default function NewDiscountPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="text-xs text-chalk-3 mb-2">
          <Link href="/admin" className="hover:text-chalk">Admin</Link>
          {' / '}
          <Link href="/admin/discounts" className="hover:text-chalk">Coupons</Link>
          {' / '}New
        </div>
        <h1 className="text-2xl font-extrabold text-chalk tracking-tight">New Coupon</h1>
      </div>

      <div className="bg-surface border border-border p-6">
        <DiscountForm action={createDiscountAction} />
      </div>
    </div>
  )
}
