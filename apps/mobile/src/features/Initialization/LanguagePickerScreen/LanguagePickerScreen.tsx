import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {LanguagePicker} from '../../../ui/LanguagePicker/LanguagePicker'

export const LanguagePickerScreen = () => {
  const {color} = useTheme()
  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.safeAreaView, {backgroundColor: color.bg_color_max}]}
    >
      <LanguagePicker />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
})