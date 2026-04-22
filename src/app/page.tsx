import HomeClient from '@/components/home/HomeClient'
import { getHome } from '@/lib/api/home'

export default async function Page() {
  let homeData: any = null
  try {
    homeData = await getHome()
  } catch {
    // fallback khi Strapi chưa có data
  }

  return <HomeClient data={homeData} />
}
