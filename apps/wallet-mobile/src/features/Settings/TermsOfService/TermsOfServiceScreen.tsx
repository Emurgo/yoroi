import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {useLanguage} from '../../../i18n'
import {TermsOfService} from '../../../Legal/TermsOfService'

export const TermsOfServiceScreen = () => {
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TermsOfService languageCode={languageCode} />
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
})
