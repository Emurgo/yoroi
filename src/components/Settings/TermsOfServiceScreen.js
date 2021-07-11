// @flow

import React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {ScrollView} from 'react-native'

import {StatusBar} from '../UiKit'
import TermsOfService from '../Common/TermsOfService'

import styles from './styles/TermsOfServiceScreen.styles'

const TermsOfServiceScreen = () => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScrollView>
      <TermsOfService />
    </ScrollView>
  </SafeAreaView>
)

export default TermsOfServiceScreen
