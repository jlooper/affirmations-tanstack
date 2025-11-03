import { createServerFn } from '@tanstack/react-start'

export interface UnsplashPhoto {
  urls: {
    regular: string
    full: string
  }
  id: string
  width: number
  height: number
  description?: string
}

export const getUnsplashPhoto = createServerFn({
  method: 'GET',
}).handler(async (): Promise<UnsplashPhoto> => {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    throw new Error('Unsplash access key not configured')
  }

  try {
    // Fetch a random photo - using the 'nature' keyword for pleasant images
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${accessKey}&orientation=landscape&query=nature,landscape,peaceful`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Unsplash photo')
    }

    const data = await response.json()
    return data as UnsplashPhoto
  } catch (error) {
    console.error('Error fetching Unsplash photo:', error)
    throw error
  }
})

