import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {type ViewProps, StyleSheet, Text, View} from 'react-native'

import {Icon} from '../Icon'

interface Props extends ViewProps {
  variant?: 'danger' | 'success' | 'neutral'
  withIcon?: boolean
}

export const PnlTag = ({
  children,
  withIcon = false,
  variant,
  style,
  ...etc
}: Props) => {
  const {color} = useTheme()

  const icon =
    variant === 'danger' ? (
      <Icon.AngleDown size={16} />
    ) : (
      <Icon.AngleUp size={16} />
    )

  const textStyles = React.useMemo(() => {
    if (variant === 'neutral') return [styles.label, {color: color.gray_600}]
    if (variant === 'success')
      return [styles.label, {color: color.secondary_700}]
    return [styles.label, {color: color.sys_magenta_700}]
  }, [
    styles.label,
    variant,
    color.gray_600,
    color.secondary_700,
    color.sys_magenta_700,
  ])

  const variantStyles = React.useMemo(() => {
    if (variant === 'neutral')
      return [styles.pnlTagContainer, {backgroundColor: color.gray_100}]
    if (variant === 'success')
      return [styles.pnlTagContainer, {backgroundColor: color.secondary_100}]
    return [styles.pnlTagContainer, {backgroundColor: color.sys_magenta_100}]
  }, [
    styles.pnlTagContainer,
    variant,
    color.gray_100,
    color.secondary_100,
    color.sys_magenta_100,
  ])

  return (
    <View style={[...variantStyles, style]} {...etc}>
      {withIcon && variant !== 'neutral' && icon}

      <Text style={textStyles}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pnlTagContainer: {
    ...a.flex,
    ...a.flex_row,
    ...a.align_center,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  label: {
    ...a.body_3_sm_medium,
  },
})
