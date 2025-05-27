import {parseSafe} from '@yoroi/common'

import {ThemeName} from '../types'
import {isThemeName} from '../validators/is-theme-name'

export const parseThemeName = (data: unknown): ThemeName => {
  const parsed = parseSafe(data)
  return isThemeName(parsed) ? parsed : 'system'
}
