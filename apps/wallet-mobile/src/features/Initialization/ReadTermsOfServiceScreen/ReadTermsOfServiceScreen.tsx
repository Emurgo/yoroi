import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../kernel/i18n'
import {TermsOfService} from '../../Legal/TermsOfService/TermsOfService'

export const ReadTermsOfServiceScreen = () => {
  const styles = useStyles()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TermsOfService languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.bg_color_max,
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
    },
  })

  return styles
}
