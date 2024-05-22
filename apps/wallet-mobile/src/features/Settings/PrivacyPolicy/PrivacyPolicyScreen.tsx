import {useTheme} from '@yoroi/theme'
import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../kernel/i18n'
import {PrivacyPolicy} from '../../Legal/PrivacyPolicy/PrivacyPolicy'

export const PrivacyPolicyScreen = () => {
  const styles = useStyles()
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <PrivacyPolicy languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: color.gray_cmin,
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
  })

  return styles
}
