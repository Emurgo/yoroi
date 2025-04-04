import {isNonNullable} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon} from '../../../../../components/Icon'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'

type Props = {
  title: string
  description: string
  onPress?(): void
  pending?: boolean
  children?: ReactNode
  showRightArrow?: boolean
  showGradient?: boolean
}

export const Action = ({title, description, onPress, pending, children, showRightArrow, showGradient}: Props) => {
  const {styles, colors} = useStyles()

  const gradientColors = showGradient ? colors.gradient : [colors.baseGradient, colors.baseGradient]

  return (
    <TouchableOpacity onPress={onPress} disabled={pending}>
      <LinearGradient
        start={{x: 1, y: 1}}
        end={{x: 0, y: 0}}
        colors={gradientColors}
        style={[styles.gradient, pending && styles.pending, !showGradient && styles.border]}
      >
        {pending && (
          <View style={styles.icon}>
            <ActivityIndicator color={colors.icon} size="small" />
          </View>
        )}

        {showRightArrow && (
          <View style={styles.icon}>
            <Icon.ArrowRight size={24} color={colors.icon} />
          </View>
        )}

        <View style={styles.root}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          {isNonNullable(children) && (
            <>
              <Spacer height={16} />

              {children}
            </>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    icon: {
      ...atoms.absolute,
      right: atoms.px_lg.paddingRight,
      top: atoms.py_lg.paddingTop,
    },
    gradient: {
      ...atoms.relative,
      ...atoms.rounded_sm,
    },
    root: {
      ...atoms.py_lg,
      ...atoms.px_lg,
      minHeight: 134,
    },
    title: {
      color: color.gray_max,
      ...atoms.font_semibold,
      ...atoms.heading_4_medium,
    },
    description: {
      color: color.gray_max,
      ...atoms.font_normal,
      ...atoms.body_1_lg_medium,
    },
    border: {
      ...atoms.border,
      borderColor: color.gray_200,
    },
    pending: {
      backgroundColor: color.bg_color_min,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
    icon: color.gray_max,
    baseGradient: 'transparent',
  }

  return {styles, colors}
}
