import {ThemeConfig} from '../types'

export const isThemeConfig = (data: unknown): data is ThemeConfig =>
  ['default-light', 'default-dark', 'system'].includes(data as string)
