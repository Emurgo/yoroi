import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

type Props = {
  children: React.ReactNode
}

export const NotificationStack = ({children}: Props) => {
  return (
    <View style={styles.absolute}>
      <SafeAreaView edges={['top']}>
        <View style={styles.flex}>{children}</View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  absolute: {
    ...a.absolute,
    top: 0,
    left: 0,
    right: 0,
    ...a.z_50,
    ...a.px_lg,
  },
  flex: {
    ...a.gap_sm,
    ...a.flex_col,
  },
})