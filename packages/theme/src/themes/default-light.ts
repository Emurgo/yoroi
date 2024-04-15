import {padding} from '../atoms/spacing'
import {Theme} from '../types'
import {typography} from '../atoms/typography'
import {light} from '../theme-palettes/light'

export const lightTheme: Theme = {
  name: 'default-light',
  color: light,
  typography: typography,
  padding: padding,
}
