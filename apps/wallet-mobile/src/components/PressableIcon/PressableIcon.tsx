import * as React from 'react'
import {TouchableOpacity, TouchableOpacityProps} from 'react-native'

type PressableIconProps = {
  size?: number
  color?: string
  icon: (props: {size?: number; color?: string}) => React.ReactNode
} & TouchableOpacityProps
export const PressableIcon = ({icon, size, color, ...props}: PressableIconProps) => (
  <TouchableOpacity {...props}>{icon({size, color})}</TouchableOpacity>
)
