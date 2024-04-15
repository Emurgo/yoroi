import {padding} from '../atoms/spacing'
import {Theme} from '../types'
import {typography} from '../atoms/typography'
import {black} from '../theme-palettes/black'

export const darkTheme: Theme = {
  name: 'default-dark',
  color: black,
  typography: typography,
  padding: padding,
}
