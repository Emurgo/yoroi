import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {useLanguage} from '../../../i18n'
import {PrivacyPolicy} from '../../../Legal'

export const PrivacyPolicyScreen = () => {
  const styles = useStyles()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <PrivacyPolicy languageCode={languageCode} />
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
