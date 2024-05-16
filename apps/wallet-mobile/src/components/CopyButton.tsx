import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleProp, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon} from '../components/Icon'
import {useCopy} from '../legacy/useCopy'

export type CopyButtonProps = {
  value: string
  onCopy?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export const CopyButton = ({value, onCopy, children, style}: CopyButtonProps) => {
  const [isCopying, copy] = useCopy()

  return (
    <AnimatedCopyButton
      style={style}
      isCopying={isCopying}
      onCopy={() => {
        copy(value)
        onCopy?.()
      }}
    >
      {children}
    </AnimatedCopyButton>
  )
}

const AnimatedCopyButton = ({
  onCopy,
  children,
  style,
  isCopying,
}: Omit<CopyButtonProps, 'value'> & {isCopying: boolean}) => {
  const {colors} = useStyles()

  return (
    <TouchableOpacity onPress={onCopy} disabled={isCopying} testID="copyButton" style={style}>
      {isCopying ? <Icon.CopySuccess size={26} color={colors.gray} /> : <Icon.Copy size={26} color={colors.gray} />}

      {children}
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const colors = {
    gray: color.gray[900],
  }

  return {colors} as const
}
