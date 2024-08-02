import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'
import {Text} from '../Text'

type Props = {
  title: string
  description: string
  onClose?: () => void
}

export const ChainWarning = ({title, description, onClose}: Props) => {
  const {isDark, color} = useTheme()
  const styles = useStyles()

  return (
    <LinearGradient
      colors={isDark ? ['rgba(19, 57, 54, 1)', 'rgba(20, 24, 58, 1)', 'rgba(22, 25, 45, 1)'] : color.bg_gradient_1} // it fixes a weird bug
      start={{x: isDark ? 0.5 : 0.5, y: isDark ? 0 : 0.5}}
      end={{x: isDark ? 0 : 0, y: isDark ? 0.5 : 0}}
      style={styles.disclaimer}
    >
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon.Close size={20} color={color.gray_cmax} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <Spacer height={8} />

      <Text style={styles.description}>{description}</Text>
    </LinearGradient>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    disclaimer: {
      ...atoms.px_lg,
      ...atoms.py_md,
      overflow: 'hidden',
      borderRadius: 8,
      position: 'relative',
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_cmax,
    },
    description: {
      ...atoms.body_2_md_regular,
      ...atoms.font_normal,
      color: color.gray_c900,
    },
    closeButton: {
      position: 'absolute',
      top: atoms.py_md.paddingTop,
      right: atoms.px_lg.paddingRight,
      zIndex: 1,
    },
  })
  return styles
}
