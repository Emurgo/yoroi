import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useLanguage} from '../../../i18n'
import {TermsOfService} from '../../../Legal'
import {useStatusBar} from '../../../theme/hooks'

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
