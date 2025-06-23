import {atoms as a} from '@yoroi/theme'

import * as React from 'react'
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native'

import {useCopy} from '../../features/Copy/context/CopyProvider'
import {Button, ButtonType} from '../Button/Button'
import {Icon} from '../Icon'

type CopyButtonProps = {
  title?: string
  value: string
  onCopy?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  message?: string
  fontOverride?: TextStyle
}

export const CopyButton = ({
  title,
  value,
  onCopy,
  message,
  style,
  fontOverride,
}: CopyButtonProps) => {
  const {isCopying, copy} = useCopy()

  return (
    <View style={style}>
      <Button
        type={ButtonType.SecondaryText}
        fontOverride={fontOverride ?? a.body_1_lg_regular}
        style={[a.p_0, a.justify_between, a.flex_grow]}
        title={title}
        icon={isCopying ? Icon.CopySuccess : Icon.Copy}
        rightIcon
        onPress={(event) => {
          copy({text: value, feedback: message, event})
          onCopy?.()
        }}
      />
    </View>
  )
}
