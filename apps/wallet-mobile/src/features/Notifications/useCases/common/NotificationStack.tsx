import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

type Props = {
  children: React.ReactNode
}

export const NotificationStack = ({children}: Props) => {
  const {styles} = useStyles()
  return (
    <View style={styles.absolute}>
      <SafeAreaView edges={['top']}>
        <View style={styles.flex}>{children}</View>
      </SafeAreaView>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    absolute: {
      ...atoms.absolute,
      top: 0,
      left: 0,
      right: 0,
      ...atoms.z_50,
      ...atoms.p_lg,
    },
    flex: {
      ...atoms.gap_sm,
      ...atoms.flex_col,
    },
  })

  return {styles}
}
