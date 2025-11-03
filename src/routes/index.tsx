import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef } from 'react'
import { RefreshCw, Loader2, Printer } from 'lucide-react'
import { getAffirmation } from '../data/fetchAffirmation'
import { getUnsplashPhoto } from '../data/fetchUnsplashPhoto'
import { uploadToCloudinary, buildCloudinaryImageUrl } from '../data/buildCloudinaryUrl'

export const Route = createFileRoute('/')({
  loader: async () => {
    try {
      // Fetch data in parallel
      const [affirmationData, unsplashData] = await Promise.all([
        getAffirmation(),
        getUnsplashPhoto(),
      ])

      // Upload the Unsplash image to Cloudinary
      const publicId = await uploadToCloudinary(unsplashData.urls.full)

      // Build the Cloudinary URL with transformations
      const cloudinaryUrl = buildCloudinaryImageUrl(publicId)

      return {
        affirmation: affirmationData.affirmation,
        cloudinaryUrl,
        photoId: unsplashData.id,
        publicId,
      }
    } catch (error) {
      console.error('Loader error:', error)
      throw error
    }
  },
  component: AffirmationPage,
})

function AffirmationPage() {
  const initialData = Route.useLoaderData()
  const [imageUrl, setImageUrl] = useState(initialData.cloudinaryUrl)
  const [affirmation, setAffirmation] = useState(initialData.affirmation)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posterRef = useRef<HTMLDivElement>(null)

  // Find the longest word in the affirmation for Successory display
  const longestWord = useMemo(() => {
    const words = affirmation.split(' ').filter(word => word.length > 0)
    return words.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    ).toUpperCase()
  }, [affirmation])

  // Add smaller dots between each letter for Successory style
  const longestWordWithDots = useMemo(() => {
    return longestWord.split('').join(' · ')
  }, [longestWord])

  const handleGetNewOne = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch new data
      const [affirmationData, unsplashData] = await Promise.all([
        getAffirmation(),
        getUnsplashPhoto(),
      ])

      // Upload the Unsplash image to Cloudinary
      const publicId = await uploadToCloudinary(unsplashData.urls.full)

      // Build the Cloudinary URL with transformations
      const cloudinaryUrl = buildCloudinaryImageUrl(publicId)

      setImageUrl(cloudinaryUrl)
      setAffirmation(affirmationData.affirmation)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch affirmation')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (posterRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Affirmation Poster</title>
              <style>
                @page {
                  size: letter portrait;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: black;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  font-family: Georgia, serif;
                }
                .poster-container {
                  width: 8.5in;
                  min-height: 11in;
                  background: black;
                  padding: 1in;
                  box-sizing: border-box;
                }
                .poster-image {
                  width: 100%;
                  aspect-ratio: 3/2;
                  object-fit: cover;
                  border: 2px solid rgba(255,255,255,0.2);
                  margin-bottom: 2rem;
                }
                .poster-word {
                  text-align: center;
                  font-size: 48pt;
                  font-weight: 900;
                  text-transform: uppercase;
                  letter-spacing: 0.2em;
                  color: #d97706;
                  margin-bottom: 1rem;
                  white-space: nowrap;
                }
                .poster-line {
                  width: 200px;
                  height: 4px;
                  background: #d97706;
                  margin: 1.5rem auto;
                }
                .poster-text {
                  text-align: center;
                  font-size: 14pt;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: white;
                  line-height: 1.6;
                  max-width: 100%;
                }
                @media print {
                  body { margin: 0; }
                  .poster-container {
                    width: 100%;
                    height: 100vh;
                  }
                }
              </style>
            </head>
            <body>
              <div class="poster-container">
                <img src="${imageUrl}" alt="${affirmation}" class="poster-image" />
                <h2 class="poster-word">${longestWordWithDots}</h2>
                <div class="poster-line"></div>
                <p class="poster-text">${affirmation}</p>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        
        // Wait for image to load before printing
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          printWindow.onafterprint = () => printWindow.close()
        }, 250)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Successory Style Poster */}
        <div ref={posterRef} className="bg-black border-4 border-white/10 p-8 shadow-2xl">
          {/* Image */}
          <div className="relative aspect-[3/2] mb-8 border border-white/20">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 border-2 border-red-500">
                <p className="text-red-400 text-center px-4">{error}</p>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={affirmation}
                className="w-full h-full object-cover"
                onError={() => {
                  console.error('Image failed to load:', imageUrl)
                  setError('Failed to load image')
                }}
                loading="lazy"
              />
            )}
          </div>

          {/* Main Word (Successory Style) */}
          {!isLoading && !error && (
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-6xl font-black uppercase tracking-[0.2em] text-amber-600 mb-4 whitespace-nowrap overflow-x-auto" style={{ fontFamily: 'Georgia, serif' }}>
                {longestWordWithDots}
              </h2>
              <div className="w-32 h-1 bg-amber-600 mx-auto mb-6"></div>
              {/* Full Affirmation Text */}
              <p className="text-lg md:text-xl uppercase tracking-wide text-white leading-relaxed max-w-3xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                {affirmation}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGetNewOne}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 text-white font-semibold rounded-lg transition-all shadow-lg shadow-amber-600/50 hover:shadow-xl hover:shadow-amber-600/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                <span>Get New Affirmation</span>
              </>
            )}
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-900 text-white font-semibold rounded-lg transition-all shadow-lg shadow-slate-700/50 hover:shadow-xl hover:shadow-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  )
}
