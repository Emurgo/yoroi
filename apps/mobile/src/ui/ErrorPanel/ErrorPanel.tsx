import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Icon} from '../Icon'
import {SpaceHeight} from '../Space/Space'

export const ErrorPanel = ({style, children, ...props}: ViewProps) => {
  const {styles, colors} = useStyles()

  return (
    <View {...props} style={[style, styles.container]}>
      <Icon.Info color={colors.icon} size={28} />

      <SpaceHeight size={10} />

      <View style={styles.message}>{children}</View>
    </View>
  )
}

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: p.sys_magenta_100,
      borderRadius: 8,
      flexDirection: 'column',
      ...a.pt_md,
      ...a.pb_sm,
      ...a.px_lg,
    },
    message: {
      flexDirection: 'row',
    },
  })
  const colors = {
    icon: p.sys_magenta_500,
  }
  return {styles, colors}
}
