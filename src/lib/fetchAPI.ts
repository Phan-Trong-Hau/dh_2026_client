import qs from 'qs'

type Props = {
  path: string
  urlParamsObject?: Record<string, any>
  options?: RequestInit
  isAuthenticated?: boolean
  isPopulate?: boolean
}

export default async function fetchAPI({
  path,
  urlParamsObject = {},
  options = {},
  isAuthenticated = true,
  isPopulate = true,
}: Props) {
  try {
    const mergedOptions = {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
        ...(isAuthenticated && {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        }),
      },
      ...options,
    } as RequestInit

    const populateRequest = isPopulate ? { pLevel: '5' } : {}

    const mergedParams = {
      ...urlParamsObject,
      ...populateRequest,
    }

    const queryString = qs.stringify(mergedParams)

    const requestUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/cms/api${path}${
      queryString ? `?${queryString}` : ''
    }`

    const response = await fetch(requestUrl, mergedOptions)
    const data = await response.json()

    return data
  } catch (error) {
    throw error
  }
}
