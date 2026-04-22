import OperationalResultClient from '@/components/operational-result/OperationalResultClient'
import { getOperationalResultPage } from '@/lib/api/operational-result'

export default async function Page() {
  let pageData: any = null
  try {
    pageData = await getOperationalResultPage()
    console.log(pageData);
  } catch {
    // fallback khi Strapi chưa có data
  }

  return <OperationalResultClient data={pageData} />
}
