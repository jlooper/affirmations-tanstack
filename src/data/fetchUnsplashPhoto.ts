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
  method: 'POST',
}).handler(async (ctx): Promise<UnsplashPhoto> => {
  const query = (ctx.data as unknown as { query?: string })?.query
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    throw new Error('Unsplash access key not configured')
  }

  try {
    // Fetch a photo based on the query, fallback to nature if no query provided
    const searchQuery = query || 'nature,landscape,peaceful'
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${accessKey}&orientation=landscape&query=${encodeURIComponent(searchQuery)}`
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

