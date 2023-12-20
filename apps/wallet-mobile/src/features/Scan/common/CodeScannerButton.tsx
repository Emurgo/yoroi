import * as React from 'react'
import {TouchableOpacityProps} from 'react-native'

import {Icon} from '../../../components'
import {PressableIcon} from '../../../components/PressableIcon/PressableIcon'
import {COLORS} from '../../../theme'

const fallbackSize = 30
const fallbackColor = COLORS.BLACK // TODO: use theme

type CodeScannerButtonProps = {
  size?: number
  color?: string
} & TouchableOpacityProps
export const CodeScannerButton = ({size = fallbackSize, color = fallbackColor, ...props}: CodeScannerButtonProps) => (
  <PressableIcon icon={Icon.Qr} size={size} color={color} {...props} />
)
