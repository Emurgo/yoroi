import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

export const FullModalScreen = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <SafeAreaView style={styles.root}>{children}</SafeAreaView>
}

const useStyles = () => {
  const {atoms, isDark, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: isDark ? color.gray_50 : color.white_static,
    },
  })
  return {styles} as const
}
