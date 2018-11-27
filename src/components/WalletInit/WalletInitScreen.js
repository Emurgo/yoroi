// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View, StatusBar} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from './WalletDescription'
import {Button} from '../UiKit'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) =>
  state.trans.CreateOrRestoreWalletScreen

type Props = {
  navigateRestoreWallet: () => mixed,
  navigateCreateWallet: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const WalletInitScreen = ({
  navigateCreateWallet,
  navigateRestoreWallet,
  translations,
}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar barStyle="light-content" backgroundColor="#254BC9" />
    <View style={styles.container}>
      <View style={styles.content}>
        <WalletDescription />
      </View>

      <Button
        onPress={navigateCreateWallet}
        title={translations.createWallet}
        style={styles.createButton}
      />

      <Button
        outline
        onPress={navigateRestoreWallet}
        title={translations.restoreWallet}
      />
    </View>
  </SafeAreaView>
)

export default compose(
  connect((state: State) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    navigateRestoreWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET),
    navigateCreateWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
  }),
)(WalletInitScreen)
