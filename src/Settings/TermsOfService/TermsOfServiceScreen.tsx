import React from 'react'
import {ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {StatusBar} from '../../components'
import {TermsOfService} from '../../FirstRun/TermsOfServiceScreen/TermsOfService'

export const TermsOfServiceScreen = () => (
  <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScrollView contentContainerStyle={styles.contentContainer}>
      <TermsOfService />
    </ScrollView>
  </SafeAreaView>
)

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
})
