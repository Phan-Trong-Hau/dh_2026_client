import HomeV2Client from '@/components/home/HomeV2Client'
import { getHomeV2 } from '@/lib/api/home'

export default async function Page() {
  let homeData: any = null
  try {
    homeData = await getHomeV2()
  } catch {
    // fallback khi Strapi chưa có data
  }

  return <HomeV2Client data={homeData} />
}
