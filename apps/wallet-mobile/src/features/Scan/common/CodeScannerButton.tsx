import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacityProps} from 'react-native'

import {Icon} from '../../../components'
import {PressableIcon} from '../../../components/PressableIcon/PressableIcon'

const fallbackSize = 30

type CodeScannerButtonProps = {
  size?: number
  color?: string
} & TouchableOpacityProps
export const CodeScannerButton = ({size = fallbackSize, color, ...props}: CodeScannerButtonProps) => {
  const {colors} = useStyles()

  return <PressableIcon icon={Icon.Qr} size={size} color={color ?? colors.iconFallback} {...props} />
}
const useStyles = () => {
  const {color} = useTheme()
  const colors = {
    iconFallback: color.gray_cmax,
  }
  return {colors}
}
