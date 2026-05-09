import React from 'react'
import fetchAPI from '@/lib/fetchAPI'
import DigitalPlatformClient from '@/components/digital-platform/DigitalPlatformClient'

export default async function DigitalPlatformPage() {
  let pageData = null
  try {
    pageData = await fetchAPI({
      path: '/digital-platform-page',
      isPopulate: true
    })
  } catch (error) {
    console.error('Failed to fetch digital platform page data:', error)
  }

  return <DigitalPlatformClient data={pageData} />
}
