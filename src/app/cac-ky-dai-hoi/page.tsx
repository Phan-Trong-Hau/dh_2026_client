import PartyConventionClient from '@/components/party-convention/PartyConventionClient'
import { getPartyConventionPage } from '@/lib/api/party-convention'

export default async function Page() {
  let pageData: any = null
  try {
    pageData = await getPartyConventionPage()
  } catch {
    // fallback khi Strapi chưa có data
  }

  return <PartyConventionClient data={pageData} />
}
