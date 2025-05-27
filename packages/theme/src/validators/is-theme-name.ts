import {ThemeName} from '../types'

export const isThemeName = (data: unknown): data is ThemeName =>
  ['default-light', 'default-dark', 'system'].includes(data as string)
