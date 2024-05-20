import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../../src/components'

interface Props extends React.ComponentPropsWithoutRef<'view'> {
  variant?: 'danger' | 'success'
  withIcon?: boolean
}

export const PnlTag = ({children, withIcon = false, variant}: Props) => {
  const {styles} = useStyles()

  const icon = variant === 'danger' ? <Icon.AngleDown size={16} /> : <Icon.AngleUp size={16} />

  return (
    <View style={[styles.pnlTagContainer, variant === 'success' ? styles.pnlSuccess : styles.pnlDanger]}>
      {withIcon && icon}

      <Text style={[styles.label, variant === 'success' ? styles.labelSuccess : styles.labelDanger]}>{children}</Text>
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
      paddingVertical: 2,
    },
    pnlSuccess: {
      backgroundColor: color.secondary_c100,
    },
    pnlDanger: {
      backgroundColor: color.sys_magenta_c100,
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
  })

  return {styles} as const
}
