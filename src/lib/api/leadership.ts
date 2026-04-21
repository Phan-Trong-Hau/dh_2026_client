import fetchAPI from '@/lib/fetchAPI'

export async function getLeadershipPage() {
  return fetchAPI({ path: '/leadership-page' })
}
