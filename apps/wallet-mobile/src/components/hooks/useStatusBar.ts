import {Palette, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, StatusBar, StatusBarStyle} from 'react-native'

import {COLORS} from '../../theme/config'
import {HexColor} from '../../theme/types'

type StatusBarColor = {
  bgColorAndroid: HexColor
  statusBarStyle: StatusBarStyle
}
export const useStatusBar = (currentRouteName: string | undefined) => {
  const {
    theme: {color: palette},
    isDark,
  } = useTheme()
  const statusBarStyleByRoute = React.useRef<StatusBarColor>(
    getStatusBarStyleByRoute({currentRouteName, isDark, palette}),
  )

  React.useEffect(() => {
    if (currentRouteName === 'modal') {
      if (Platform.OS === 'android')
        StatusBar.setBackgroundColor(simulateOpacity(statusBarStyleByRoute.current.bgColorAndroid), true)
    } else {
      const style = getStatusBarStyleByRoute({currentRouteName, isDark, palette})
      statusBarStyleByRoute.current = style
      if (Platform.OS === 'android') StatusBar.setBackgroundColor(style.bgColorAndroid, true)
      StatusBar.setBarStyle(style.statusBarStyle, true)
    }
  }, [currentRouteName, isDark, palette])
}

const getStatusBarStyleByRoute = ({
  currentRouteName,
  isDark,
  palette,
}: {
  currentRouteName: string | undefined
  isDark?: boolean
  palette: Palette
}): StatusBarColor => {
  if (currentRouteName) {
    if (currentRouteName === 'history-list') {
      return {
        bgColorAndroid: palette.primary[100],
        statusBarStyle: 'dark-content',
      }
    } else if (oldBlueRoutes.includes(currentRouteName)) {
      return {
        bgColorAndroid: COLORS.BACKGROUND_BLUE as HexColor,
        statusBarStyle: 'light-content',
      }
    } else if (currentRouteName === 'scan-start') {
      return {
        bgColorAndroid: palette['black-static'],
        statusBarStyle: 'dark-content',
      }
    }
  }
  return {
    bgColorAndroid: isDark ? palette['black-static'] : palette['white-static'],
    statusBarStyle: isDark ? 'light-content' : 'dark-content',
  }
}

const oldBlueRoutes = ['wallet-selection', 'choose-create-restore', 'enable-login-with-os', 'auth-with-os']

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
