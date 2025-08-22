import {parseSafe} from '@yoroi/common'

import {ThemeConfig} from '../types'
import {isThemeConfig} from '../validators/is-theme-config'

export const parseThemeConfig = (data: unknown): ThemeConfig => {
  const parsed = parseSafe(data)
  return isThemeConfig(parsed) ? parsed : 'system'
}
