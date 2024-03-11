import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {useEffect} from 'react'
import {Platform, StatusBar as StatusBarRN} from 'react-native'

import {useModal} from '../components'
import {HexColor} from './types'

/**
 *
 * @param color Hex color in #224466 format
 * @returns Hex color halved #112233, same as if the modal backdrop was on top rgba(0,0,0,0.5) of it
 */
const opaqueColor = (color: HexColor) => {
  try {
    return `#${[...color.substring(1)]
      .flatMap((_, i, a) => (i % 2 ? [] : [a.slice(i, i + 2)]))
      .map((hex) =>
        Math.floor(Number(`0x${hex.join('')}`) / 2)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`
  } catch {
    return color
  }
}

export const useStatusBar = (pageColor?: HexColor, legacyModal?: boolean) => {
  const {theme, isDark} = useTheme()
  const {isOpen} = useModal()
  const color = pageColor ?? (isDark ? theme.color['black-static'] : theme.color['white-static'])
  const bgColor = isOpen || legacyModal ? opaqueColor(color) : color

  const effect = () => {
    StatusBarRN.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
    if (Platform.OS === 'android') StatusBarRN.setBackgroundColor(bgColor, true)
  }
  useFocusEffect(effect)
  useEffect(effect, [bgColor, isDark, isOpen])
}
