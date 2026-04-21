import LeadershipClient from '@/components/leadership/LeadershipClient'
import { getLeadershipPage } from '@/lib/api/leadership'

export default async function Page() {
  let pageData: any = null
  try {
    pageData = await getLeadershipPage()
  } catch (error) {
    console.error('Failed to fetch leadership page data:', error)
  }

  return <LeadershipClient data={pageData} />
}
