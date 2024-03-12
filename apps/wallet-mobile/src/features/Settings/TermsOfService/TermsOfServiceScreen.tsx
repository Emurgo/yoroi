import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../i18n'
import {TermsOfService} from '../../../Legal/TermsOfService'
import {useStatusBar} from '../../../theme/hooks'

export const TermsOfServiceScreen = () => {
  const styles = useStyles()
  const {languageCode} = useLanguage()
  useStatusBar()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TermsOfService languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.gray.min,
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
  })
  return styles
}
