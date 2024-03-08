import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../../components'
import {useLanguage} from '../../../i18n'
import {PrivacyPolicy} from '../../../Legal'

export const ReadPrivacyPolicyScreen = () => {
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

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
})
