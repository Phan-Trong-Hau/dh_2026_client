import fetchAPI from '@/lib/fetchAPI'

export async function getOperationalResultPage() {
  return fetchAPI({ path: '/operational-result-page' })
}
