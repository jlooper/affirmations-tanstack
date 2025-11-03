interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
}

/**
 * Uploads an Unsplash image to Cloudinary and returns the public_id
 */
export async function uploadToCloudinary(url: string): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned'

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured')
  }

  try {
    // For signed uploads, we need to generate a signature
    // First, upload using the unsigned preset (requires upload preset in Cloudinary)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: new URLSearchParams({
          file: url,
          upload_preset: uploadPreset, // Uses VITE_CLOUDINARY_UPLOAD_PRESET or defaults to 'unsigned'
          folder: 'affirmations',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Upload failed:', errorData)
      throw new Error(`Cloudinary upload failed: ${errorData}`)
    }

    const data = (await response.json()) as CloudinaryUploadResponse
    return data.public_id
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

/**
 * Builds a Cloudinary URL without text overlay for Successory style
 * @param publicId - The Cloudinary public_id (after upload)
 * @returns The complete Cloudinary transformation URL
 */
export function buildCloudinaryImageUrl(publicId: string): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured')
  }

  // Don't encode the public_id - Cloudinary expects the raw path
  // Slashes in public_id are valid path separators
  const plainPublicId = publicId
  
  const transformations = [
    `c_fill,w_1200,h_800`, // Fill to 1200x800 for poster feel
    `f_auto`, // Auto format
    `q_auto`, // Auto quality
  ].join('/')

  // Return the complete Cloudinary URL with transformations
  // Note: public_id with folder path (e.g., affirmations/ebqlhasct6aenp7zcylr) should not be encoded
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${plainPublicId}`
}
