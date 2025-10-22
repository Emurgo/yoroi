import {isAndroid, isDev, isIOS, isNative, isWeb} from './constants'

export function web<T = unknown>(value: T): T | undefined {
  if (isWeb) return value
  return
}

export function native<T = unknown>(value: T): T | undefined {
  if (isNative) return value
  return
}

export function ios<T = unknown>(value: T): T | undefined {
  if (isIOS) return value
  return
}

export function android<T = unknown>(value: T): T | undefined {
  if (isAndroid) return value
  return
}

export function dev<T = unknown>(value: T): T | undefined {
  if (isDev) return value
  return
}
