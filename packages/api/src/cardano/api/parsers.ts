import {
  isArrayOfType,
  isPositiveNumber,
  isRecord,
  isString,
  isStringOrArrayOfString,
} from '@yoroi/common'
import {ApiFtMetadata, ApiMetadataFile, ApiNftMetadata} from '@yoroi/types'

export function isMetadataFile(data: unknown): data is ApiMetadataFile {
  if (!isRecord(data)) return false

  const file = data as Partial<ApiMetadataFile>

  if (file.name && !isString(file.name)) return false
  if (!isString(file.mediaType)) return false
  if (!isStringOrArrayOfString(file.src)) return false

  return true
}

export function isNftMetadata(data: unknown): data is ApiNftMetadata {
  if (!isRecord(data)) return false

  const metadata = data as Partial<ApiNftMetadata>

  if (!isString(metadata.name)) return false
  if (!isStringOrArrayOfString(metadata.image)) return false
  if (metadata.mediaType && !isString(metadata.mediaType)) return false
  if (metadata.description && !isStringOrArrayOfString(metadata.description))
    return false

  if (
    metadata.files &&
    !isArrayOfType(metadata.files, isMetadataFile) &&
    !isMetadataFile(metadata.files)
  )
    return false

  return true
}

export function isFtMetadata(data: unknown): data is ApiFtMetadata {
  if (!isRecord(data)) return false

  const metadata = data as Partial<ApiFtMetadata>

  if (!isString(metadata.name)) return false

  if (metadata.description && !isStringOrArrayOfString(metadata.description))
    return false
  if (metadata.policy && !isStringOrArrayOfString(metadata.policy)) return false
  if (metadata.logo && !isStringOrArrayOfString(metadata.logo)) return false
  if (metadata.ticker && !isString(metadata.ticker)) return false
  if (metadata.url && !isStringOrArrayOfString(metadata.url)) return false

  if (metadata.decimals !== undefined && !isPositiveNumber(metadata.decimals))
    return false

  return true
}

export function parseNftMetadataRecord(
  data: Readonly<Record<string, unknown>>,
) {
  return isNftMetadata(data) ? data : undefined
}

export function parseFtMetadataRecord(data: Readonly<Record<string, unknown>>) {
  return isFtMetadata(data) ? data : undefined
}
