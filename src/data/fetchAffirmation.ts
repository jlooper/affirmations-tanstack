import { createServerFn } from '@tanstack/react-start'

export interface AffirmationResponse {
  affirmation: string
}

export const getAffirmation = createServerFn({
  method: 'GET',
}).handler(async (): Promise<AffirmationResponse> => {
  try {
    const response = await fetch('https://www.affirmations.dev/')
    if (!response.ok) {
      throw new Error('Failed to fetch affirmation')
    }
    const data = await response.json()
    return data as AffirmationResponse
  } catch (error) {
    console.error('Error fetching affirmation:', error)
    throw error
  }
})
