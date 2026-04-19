import fetchAPI from '@/lib/fetchAPI'

export async function getHome() {
  return fetchAPI({ path: '/home' })
}

export function getStrapiImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`
}
