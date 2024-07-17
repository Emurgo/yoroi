import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../../components'

export const LanguagePickerScreen = () => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <LanguagePicker />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
  })

  return styles
}
