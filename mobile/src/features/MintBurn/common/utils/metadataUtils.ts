import {validateImageUrl} from './imageUtils'

/**
 * Convert string to hex
 */
function toHex(input: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
  let hex = ''
  for (let i = 0; i < bytes.length; i += 1) {
    const h = bytes[i]!.toString(16).padStart(2, '0')
    hex += h
  }
  return hex
}

/**
 * Create CIP-25 metadata for NFT (label 721)
 */
export function createNFTMetadata(
  policyId: string,
  assetName: string,
  name: string,
  imageUrl: string,
  description?: string,
): Record<string, unknown> {
  // Validate image URL
  const imageValidation = validateImageUrl(imageUrl)
  if (!imageValidation.valid) {
    throw new Error(imageValidation.error || 'Invalid image URL')
  }

  const metadata: Record<string, unknown> = {
    '721': {
      [policyId]: {
        [assetName]: {
          name,
          image: imageUrl,
          ...(description && {description}),
        },
      },
      version: 1,
    },
  }

  return metadata
}

/**
 * Split a string into chunks of max 64 characters for Cardano metadata
 * Cardano metadata strings have a max length of 64 characters
 */
function splitIntoChunks(str: string, maxLength: number = 64): string[] {
  const chunks: string[] = []
  for (let i = 0; i < str.length; i += maxLength) {
    chunks.push(str.slice(i, i + maxLength))
  }
  return chunks
}

/**
 * Create CIP-26 metadata for FT (label 20)
 * Note: CIP-26 uses URI Array format for images, where each string must be <= 64 characters
 * For base64 images, we split them into chunks to comply with this limit
 */
export function createFTMetadata(
  policyId: string,
  assetName: string,
  name: string,
  decimals: number,
  imageBase64: string,
  description?: string,
): Record<string, unknown> {
  // Validate image is base64 data URI
  if (!imageBase64.startsWith('data:image/')) {
    throw new Error('Image must be a base64 data URI')
  }

  // Split base64 image into chunks of max 64 characters for Cardano metadata
  // Cardano metadata strings have a max length of 64 characters
  const imageChunks = splitIntoChunks(imageBase64, 64)

  const metadata: Record<string, unknown> = {
    '20': {
      [policyId]: {
        [assetName]: {
          name,
          decimals,
          // Use URI Array format (array of strings, each <= 64 chars)
          // Viewers will concatenate these to reconstruct the full base64 data URI
          image: imageChunks,
          ...(description && {
            // Description also needs to be split if it's too long
            description:
              description.length > 64
                ? splitIntoChunks(description, 64)
                : description,
          }),
        },
      },
    },
  }

  return metadata
}

/**
 * Convert asset name to hex
 */
export function assetNameToHex(assetName: string): string {
  return toHex(assetName)
}

/**
 * Convert hex to asset name (for display)
 */
export function hexToAssetName(hex: string): string {
  try {
    const bytes = new Uint8Array(
      hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    )
    return new TextDecoder().decode(bytes)
  } catch {
    return hex
  }
}
