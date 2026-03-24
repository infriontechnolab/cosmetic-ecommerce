import HeroSection from '@/components/sections/HeroSection'
import TrustBar from '@/components/sections/TrustBar'
import TopCategories from '@/components/sections/TopCategories'
import ShopByBrand from '@/components/sections/ShopByBrand'
import SkinConcerns from '@/components/sections/SkinConcerns'
import EditorsPicks from '@/components/sections/EditorsPicks'
import LoyaltyRewards from '@/components/sections/LoyaltyRewards'
import TodaysBestDeals from '@/components/sections/TodaysBestDeals'
import EveningRitual from '@/components/sections/EveningRitual'
import CustomerReviews from '@/components/sections/CustomerReviews'
import ShadeQuizCTA from '@/components/sections/ShadeQuizCTA'
import Newsletter from '@/components/sections/Newsletter'
import { getCategories, getBrandsData, getSkinConcerns, getReviews } from '@/lib/api'

export default async function Home() {
  const [cats, brandsData, concerns, reviews] = await Promise.all([
    getCategories(),
    getBrandsData(),
    getSkinConcerns(),
    getReviews(),
  ])

  return (
    <>
      <HeroSection />
      <TrustBar />
      <TopCategories cats={cats} />
      <ShopByBrand initialData={brandsData} />
      <SkinConcerns concerns={concerns} />
      <EditorsPicks />
      <LoyaltyRewards />
      <TodaysBestDeals />
      <EveningRitual />
      <CustomerReviews reviews={reviews} />
      <ShadeQuizCTA />
      <Newsletter />
    </>
  )
}
