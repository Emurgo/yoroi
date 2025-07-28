import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {type ViewProps, Text, View} from 'react-native'

import {Icon} from '~/ui/Icon'

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
  const {palette: p} = useTheme()

  const icon =
    variant === 'danger' ? (
      <Icon.AngleDown size={16} />
    ) : (
      <Icon.AngleUp size={16} />
    )

  const textStyles = React.useMemo(() => {
    if (variant === 'neutral') return [a.body_3_sm_medium, {color: p.gray_600}]
    if (variant === 'success')
      return [a.body_3_sm_medium, {color: p.secondary_700}]
    return [a.body_3_sm_medium, {color: p.sys_magenta_700}]
  }, [variant, p.gray_600, p.secondary_700, p.sys_magenta_700])

  const variantStyles = React.useMemo(() => {
    if (variant === 'neutral')
      return [
        a.flex,
        a.flex_row,
        a.align_center,
        {borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3},
        {backgroundColor: p.gray_100},
      ]
    if (variant === 'success')
      return [
        a.flex,
        a.flex_row,
        a.align_center,
        {borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3},
        {backgroundColor: p.secondary_100},
      ]
    return [
      a.flex,
      a.flex_row,
      a.align_center,
      {borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3},
      {backgroundColor: p.sys_magenta_100},
    ]
  }, [variant, p.gray_100, p.secondary_100, p.sys_magenta_100])

  return (
    <View style={[...variantStyles, style]} {...etc}>
      {withIcon && variant !== 'neutral' && icon}

      <Text style={textStyles}>{children}</Text>
    </View>
  )
}
