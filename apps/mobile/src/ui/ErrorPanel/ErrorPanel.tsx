import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View, ViewProps} from 'react-native'

import {Icon} from '../Icon'
import {SpaceHeight} from '../Space/Space'

export const ErrorPanel = ({style, children, ...props}: ViewProps) => {
  const {palette: p} = useTheme()

  return (
    <View
      {...props}
      style={[
        style,
        {
          backgroundColor: p.sys_magenta_100,
          borderRadius: 8,
          flexDirection: 'column',
        },
        a.pt_md,
        a.pb_sm,
        a.px_lg,
      ]}
    >
      <Icon.Info color={p.sys_magenta_500} size={28} />

      <SpaceHeight size={10} />

      <View style={[{flexDirection: 'row'}]}>{children}</View>
    </View>
  )
}
