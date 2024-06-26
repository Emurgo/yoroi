import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {type ViewProps, StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../components'

interface Props extends ViewProps {
  variant?: 'danger' | 'success' | 'neutral'
  withIcon?: boolean
}

export const PnlTag = ({children, withIcon = false, variant, style, ...etc}: Props) => {
  const {styles} = useStyles()

  const icon = variant === 'danger' ? <Icon.AngleDown size={16} /> : <Icon.AngleUp size={16} />

  const textStyles = React.useMemo(() => {
    if (variant === 'neutral') return [styles.label, styles.labelNeutral]
    if (variant === 'success') return [styles.label, styles.labelSuccess]
    return [styles.label, styles.labelDanger]
  }, [styles.label, styles.labelDanger, styles.labelNeutral, styles.labelSuccess, variant])

  const variantStyles = React.useMemo(() => {
    if (variant === 'neutral') return [styles.pnlTagContainer, styles.pnlNeutral]
    if (variant === 'success') return [styles.pnlTagContainer, styles.pnlSuccess]
    return [styles.pnlTagContainer, styles.pnlDanger]
  }, [styles.pnlDanger, styles.pnlNeutral, styles.pnlSuccess, styles.pnlTagContainer, variant])

  return (
    <View style={[...variantStyles, style]} {...etc}>
      {withIcon && variant !== 'neutral' && icon}

      <Text style={[styles.label, textStyles]}>{children}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    pnlTagContainer: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.align_center,
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    pnlSuccess: {
      backgroundColor: color.secondary_c100,
    },
    pnlDanger: {
      backgroundColor: color.sys_magenta_c100,
    },
    pnlNeutral: {
      backgroundColor: color.gray_c100,
    },
    label: {
      ...atoms.body_3_sm_medium,
    },
    labelSuccess: {
      color: color.secondary_c700,
    },
    labelDanger: {
      color: color.sys_magenta_c700,
    },
    labelNeutral: {
      color: color.gray_c600,
    },
  })

  return {styles} as const
}
