import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {COLORS} from '../../theme'
import {Icon} from '../Icon'
import {Spacer} from '../Spacer'

export const ErrorPanel = ({style, children, ...props}: ViewProps) => {
  return (
    <View {...props} style={[style, styles.container]}>
      <Icon.Info color={COLORS.ERROR_TEXT_COLOR} />

      <Spacer height={10} />

      <View style={styles.message}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    borderRadius: 8,
    flexDirection: 'column',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  message: {
    flexDirection: 'row',
  },
})
