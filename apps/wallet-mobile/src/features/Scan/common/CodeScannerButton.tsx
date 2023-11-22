import * as React from 'react'
import {Pressable, PressableProps} from 'react-native'

import {Icon} from '../../../components'
import {COLORS} from '../../../theme'

const fallbackSize = 30
const fallbackColor = COLORS.BLACK // TODO: use theme

type CodeScannerButtonProps = {
  size?: number
  color?: string
} & PressableProps
export const CodeScannerButton = ({size = fallbackSize, color = fallbackColor, ...props}: CodeScannerButtonProps) => (
  <PressableIcon icon={Icon.Qr} size={size} color={color} {...props} />
)

type PressableIconProps = {
  size: number
  color: string
  icon: (props: {size: number; color: string}) => React.ReactNode
} & PressableProps
const PressableIcon = ({icon, size, color, ...props}: PressableIconProps) => (
  <Pressable {...props}>{icon({size, color})}</Pressable>
)
