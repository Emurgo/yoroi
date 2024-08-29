import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

export const ErrorPanel = ({style, children, ...props}: ViewProps) => {
  const {styles, colors} = useStyles()

  return (
    <View {...props} style={[style, styles.container]}>
      <Icon.Info color={colors.icon} />

      <Spacer height={10} />

      <View style={styles.message}>{children}</View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(255, 16, 81, 0.06)',
      borderRadius: 8,
      flexDirection: 'column',
      ...atoms.pt_md,
      ...atoms.pb_sm,
      ...atoms.px_lg,
    },
    message: {
      flexDirection: 'row',
    },
  })
  const colors = {
    icon: color.sys_magenta_500,
  }
  return {styles, colors}
}
