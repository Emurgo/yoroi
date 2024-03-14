import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useStatusBar} from '../../../components/hooks/useStatusBar'
import {useLanguage} from '../../../i18n'
import {TermsOfService} from '../../../Legal'

export const ReadTermsOfServiceScreen = () => {
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

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})
