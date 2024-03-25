import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, StatusBar as StatusBarRN} from 'react-native'

import {HexColor} from '../../theme/types'
import {useIsRouteActive} from '../../utils/navigation'
import {useModal} from '../Modal/ModalContext'

export const useStatusBar = (baseColor?: HexColor, legacyModal = false) => {
  const {theme, isDark} = useTheme()
  const {isOpen} = useModal()

  const isActive = useIsRouteActive()

  const reflectStatusBarColor = React.useCallback(() => {
    if (!isActive) return
    const color = baseColor ?? (isDark ? theme.color['black-static'] : theme.color['white-static'])
    const bgColor = isOpen || legacyModal ? simulateOpacity(color) : color

    StatusBarRN.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
    if (Platform.OS === 'android') StatusBarRN.setBackgroundColor(bgColor, true)
  }, [baseColor, isDark, isOpen, legacyModal, theme.color, isActive])

  // Reflect the status bar color when the screen is focused
  useFocusEffect(reflectStatusBarColor)
  // Reflect the status bar color when the modal is opened or closed
  React.useEffect(reflectStatusBarColor, [isOpen, legacyModal, reflectStatusBarColor])
}

/**
 *
 * @description Returns a color with half intensity, to simulate opacity, used to mimic the modal backdrop on top of it, I.e rgba(0,0,0,0.5), it will ignore the alpha channel if it was passed along with the color
 * @param color Hex color in "#224466" | "#22446620" | #246" | "#2468" format
 * @returns Hex color halved "#112233" | "#11223320" if the input is correct, otherwise it will return the same color passed
 * @warning This function will ignore the alpha channel if it was passed along with the color
 * @warning This function ignore named colors, by ignoring, it means returning the same color passed
 */
export const simulateOpacity = (color: HexColor): HexColor => {
  if (!/^#([0-9A-Fa-f]{3}([0-9A-Fa-f]{1})?|[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?)$/.test(color)) {
    return color
  }
  const expandedColor = expandColor(color)
  const alphaChannel = expandedColor.substring(7, 9).toLowerCase()

  // 1, 7 to ignore if alpha channel was passed along with the color
  const opaquedColor = [...expandedColor.substring(1, 7)]
    .reduce(toRgb, [] as string[])
    .map(halveIntensity)
    .join('')
    .toLowerCase()

  return `#${opaquedColor}${alphaChannel}`
}

const halveIntensity = (hex: string) => {
  return Math.floor(parseInt(hex, 16) / 2)
    .toString(16)
    .padStart(2, '0')
}

const toRgb = (fullHexColor: string[], value: string, index: number) => {
  if (index % 2 === 0) fullHexColor.push(value)
  else fullHexColor[fullHexColor.length - 1] += value
  return fullHexColor
}

const expandColor = (color: HexColor) => {
  if (color.length === 4 || color.length === 5) {
    return '#'.concat(
      color
        .substring(1)
        .split('')
        .map((char) => char + char)
        .join(''),
    )
  }
  return color
}
