import {isNumber, isRecord, isString} from '@yoroi/common'
import {freeze} from 'immer'

type TraitValueExpanded =
  | {
      type: 'link' | 'string'
      originalValue: string
      transformedValue: string
    }
  | {
      type: 'number'
      originalValue: number
      transformedValue: number
    }
  | {
      type: 'array'
      originalValue: unknown[]
      transformedValue: unknown[]
    }
  | {
      type: 'record'
      originalValue: Record<string, unknown>
      transformedValue: Record<string, unknown>
    }
  | {
      type: 'unknown'
      originalValue: unknown
      transformedValue: unknown
    }

export function traitValueExpander(value: unknown): TraitValueExpanded {
  const type = detectType(value)

  switch (type) {
    case 'link':
    case 'string': {
      const transformedValue =
        type === 'link' ? transformIfIpfs(value as string) : (value as string)
      return freeze({
        originalValue: value as string,
        transformedValue,
        type,
      } as const)
    }
    case 'number': {
      return freeze({
        originalValue: value as number,
        transformedValue: value as number,
        type,
      } as const)
    }
    case 'array': {
      return freeze({
        originalValue: value as unknown[],
        transformedValue: value as unknown[],
        type,
      } as const)
    }
    case 'record': {
      return freeze({
        originalValue: value as Record<string, unknown>,
        transformedValue: value as Record<string, unknown>,
        type,
      } as const)
    }
    default: {
      return freeze({
        originalValue: value,
        transformedValue: value,
        type: 'unknown',
      } as const)
    }
  }
}

function isValidUrl(string: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(string)
    return true
  } catch (e) {
    return false
  }
}

function transformIfIpfs(value: string) {
  if (value.startsWith('ipfs://'))
    return value.replace('ipfs://', 'https://ipfs.io/ipfs/')

  return value
}

function detectType(value: unknown) {
  if (isString(value)) {
    if (isValidUrl(value)) {
      return 'link'
    }
    return 'string'
  } else if (isNumber(value)) {
    return 'number'
  } else if (Array.isArray(value)) {
    return 'array'
  } else if (isRecord(value)) {
    return 'record'
  } else {
    return 'unknown'
  }
}
