import {isAndroid, isDev, isIOS, isNative, isWeb} from './constants'

export function web<T = unknown>(value: T): T | undefined {
  if (isWeb) return value
}

export function native<T = unknown>(value: T): T | undefined {
  if (isNative) return value
}

export function ios<T = unknown>(value: T): T | undefined {
  if (isIOS) return value
}

export function android<T = unknown>(value: T): T | undefined {
  if (isAndroid) return value
}

export function dev<T = unknown>(value: T): T | undefined {
  if (isDev) return value
}
