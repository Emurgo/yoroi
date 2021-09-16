// @flow

import React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import TermsOfService from '../Common/TermsOfService'
import {StatusBar} from '../UiKit'
import styles from './styles/TermsOfServiceScreen.styles'

const TermsOfServiceScreen = () => (
  <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScrollView contentContainerStyle={styles.contentContainer}>
      <TermsOfService />
    </ScrollView>
  </SafeAreaView>
)

export default TermsOfServiceScreen
