import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'

import {useCopy} from '../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../components/Icon'

export const CopiableText = ({
  children,
  style,
  textToCopy,
}: {
  children: React.ReactNode
  style?: ViewStyle
  textToCopy: string
}) => {
  const {styles} = useStyles()

  return (
    <View style={[styles.text, style]}>
      {children}

      <CopyButton textToCopy={textToCopy} />
    </View>
  )
}

export const CopyButton = ({textToCopy}: {textToCopy: string}) => {
  const {colors} = useStyles()
  const {copy} = useCopy()
  return (
    <TouchableOpacity onPress={() => copy({text: textToCopy})} activeOpacity={0.5}>
      <Icon.Copy size={24} color={colors.copy} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
