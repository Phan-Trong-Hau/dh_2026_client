import fetchAPI from '@/lib/fetchAPI'

export async function getPartyConventionPage() {
  return fetchAPI({ path: '/party-convention-page' })
}
