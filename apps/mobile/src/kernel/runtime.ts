import * as Device from 'expo-device'
import {Platform} from 'react-native'

import {buildVariant} from './env'

export const isNightly = buildVariant === 'NIGHTLY'
export const isProduction = buildVariant === 'PROD'
export const isDev = __DEV__

export const environment = isNightly
  ? 'nightly'
  : isProduction
    ? 'production'
    : 'development'
export const version = Device.osVersion ?? ''
export const release = isProduction ? version : 'dev'
export const build = Device.osBuildId ?? ''
export const distribution = `${Platform.OS}.${build}`

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isNative = isIOS || isAndroid
export const isWeb = !isNative

export const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'web'

export function web(value: unknown) {
  if (isWeb) return value
}

export function native(value: unknown) {
  if (isNative) return value
}

export function ios(value: unknown) {
  if (isIOS) return value
}

export function android(value: unknown) {
  if (isAndroid) return value
}

export function dev(value: unknown) {
  if (isDev) return value
}
