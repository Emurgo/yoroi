import React from 'react'
import {StyleProp, TouchableOpacity, ViewStyle} from 'react-native'

import {Icon} from '../components/Icon'
import {useCopy} from '../legacy/useCopy'
import {COLORS} from '../theme'

export type CopyButtonProps = {
  value?: string
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
  return (
    <TouchableOpacity onPress={onCopy} disabled={isCopying} testID="copyButton" style={style}>
      {isCopying ? <Icon.CopySuccess size={26} color={COLORS.GRAY} /> : <Icon.Copy size={26} color={COLORS.GRAY} />}

      {children}
    </TouchableOpacity>
  )
}
