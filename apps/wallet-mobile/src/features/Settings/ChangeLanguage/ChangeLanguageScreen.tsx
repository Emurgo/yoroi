import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../../components'

export const ChangeLanguageScreen = () => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <LanguagePicker />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
  })
  return styles
}
