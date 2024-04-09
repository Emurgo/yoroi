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
  const {theme} = useTheme()
  const {color, padding} = theme
  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(255, 16, 81, 0.06)',
      borderRadius: 8,
      flexDirection: 'column',
      ...padding['t-m'],
      ...padding['b-s'],
      ...padding['x-l'],
    },
    message: {
      flexDirection: 'row',
    },
  })
  const colors = {
    icon: color.magenta[500],
  }
  return {styles, colors}
}
