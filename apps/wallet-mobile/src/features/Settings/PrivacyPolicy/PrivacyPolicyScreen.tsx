import {useLanguage} from '../../../i18n'
import {SafeAreaView} from 'react-native-safe-area-context'
import {StatusBar} from '../../../components'
import {ScrollView, StyleSheet} from 'react-native'
import {PrivacyPolicy} from '../../../Legal'
import React from 'react'

export const PrivacyPolicyScreen = () => {
  const {languageCode} = useLanguage()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

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
    padding: 16,
  },
})
