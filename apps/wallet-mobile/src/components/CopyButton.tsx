import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'

import {Icon} from '../components/Icon'
import {Button, ButtonType} from './Button/Button'
import {useCopy} from './Clipboard/ClipboardProvider'

type CopyButtonProps = {
  title?: string
  value: string
  onCopy?: () => void
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  message?: string
}

export const CopyButton = ({title, value, onCopy, message, style}: CopyButtonProps) => {
  const {isCopying, copy} = useCopy()
  const {atoms} = useTheme()

  return (
    <View style={style}>
      <Button
        type={ButtonType.SecondaryText}
        fontOverride={atoms.body_1_lg_regular}
        style={{...atoms.p_0, ...atoms.justify_between, flexGrow: 0}}
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
