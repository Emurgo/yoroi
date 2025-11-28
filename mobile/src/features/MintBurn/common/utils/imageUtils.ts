/**
 * Validate base64 image data URI for FT token
 * Expects format: data:image/<type>;base64,<base64data>
 */
export function validateBase64Image(dataUri: string): {
  valid: boolean
  error?: string
} {
  if (!dataUri || typeof dataUri !== 'string') {
    return {valid: false, error: 'Image data is required'}
  }

  if (!dataUri.startsWith('data:image/')) {
    return {
      valid: false,
      error: 'Image must be a base64 data URI starting with data:image/',
    }
  }

  const dataUriPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/
  if (!dataUriPattern.test(dataUri.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid image format. Must be PNG, JPEG, GIF, or WebP',
    }
  }

  // Extract base64 part
  const base64Part = dataUri.split(',')[1]
  if (!base64Part || base64Part.length === 0) {
    return {valid: false, error: 'Invalid base64 data'}
  }

  return {valid: true}
}

/**
 * Validate image URL format
 */
export function validateImageUrl(url: string): {
  valid: boolean
  error?: string
} {
  if (!url || typeof url !== 'string') {
    return {valid: false, error: 'Image URL is required'}
  }

  // Check for valid URI schemes
  const validSchemes = ['https://', 'http://', 'ipfs://', 'ar://', 'data:']
  const hasValidScheme = validSchemes.some((scheme) =>
    url.toLowerCase().startsWith(scheme.toLowerCase()),
  )

  if (!hasValidScheme) {
    return {
      valid: false,
      error: 'Image URL must start with https://, ipfs://, ar://, or data:',
    }
  }

  // Validate data URI format if it's a data URI
  if (url.startsWith('data:')) {
    const dataUriPattern =
      /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml|tiff);base64,/
    if (!dataUriPattern.test(url.toLowerCase())) {
      return {
        valid: false,
        error:
          'Invalid data URI format. Must be: data:image/<type>;base64,<data>',
      }
    }
  }

  return {valid: true}
}

/**
 * Validate image MIME type
 */
export function validateImageMimeType(mimeType: string): boolean {
  const validTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
  ]
  return validTypes.includes(mimeType.toLowerCase())
}
