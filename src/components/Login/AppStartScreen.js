// @flow

import React from 'react'
import {View, StatusBar} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from '../WalletInit/WalletDescription'
import {Button} from '../UiKit'
import styles from './styles/AppStartScreen.style'
import {ROOT_ROUTES} from '../../RoutesList'
import {withTranslations} from '../../utils/renderUtils'

import type {State} from '../../state'

const getTranslations = (state: State) => state.trans.AppStartScreen

const AppStartScreen = ({navigateLogin, translations}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar barStyle="light-content" backgroundColor="#254BC9" />
    <View style={styles.container}>
      <View style={styles.content}>
        <WalletDescription />
      </View>

      <Button
        outline
        onPress={navigateLogin}
        title={translations.loginButton}
      />
    </View>
  </SafeAreaView>
)

export default compose(
  withTranslations(getTranslations),
  withHandlers({
    // TODO: goes to wallet selection by now
    navigateLogin: ({navigation}) => (event) =>
      navigation.navigate(ROOT_ROUTES.WALLET_SELECTION),
  }),
)(AppStartScreen)
