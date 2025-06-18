import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from 'react-native'

import {Icon} from '../Icon'
import {useCopy} from './ClipboardProvider'

type CopiableProps = {
  text: string
  title?: string
  children?: React.ReactNode
  style?: ViewStyle
  feedback?: string
  onCopy?: () => void
}

export const Copiable = ({children, style, text, title, feedback, onCopy}: CopiableProps) => {
  const {styles, colors} = useStyles()
  const {isCopying, copy} = useCopy()
  const CopyIcon = isCopying ? Icon.CopySuccess : Icon.Copy

  return (
    <View style={[styles.container, style]}>
      {title !== undefined && (
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {children}

      <TouchableOpacity
        onPress={(event) => {
          copy({text, event, feedback})
          onCopy?.()
        }}
        activeOpacity={0.5}
      >
        <CopyIcon size={25} color={colors.copy} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_xs,
    },
    content: {
      ...atoms.flex_1,
    },
    title: {
      ...atoms.body_2_md_regular,
      color: color.el_gray_max,
    },
  })

  const colors = {
    copy: color.gray_900,
  }

  return {styles, colors} as const
}
