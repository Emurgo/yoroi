// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'

import WalletDescription from './WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'

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
    <StatusBar type="dark" />

    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <WalletDescription />
        </View>

        <Button
          onPress={navigateCreateWallet}
          title={translations.createWalletButton}
          style={styles.createButton}
        />

        <Button
          outline
          onPress={navigateRestoreWallet}
          title={translations.restoreWalletButton}
        />
      </View>
    </ScreenBackground>
  </SafeAreaView>
)

export default compose(
  connect((state: State) => ({
    translations: getTranslations(state),
  })),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    navigateRestoreWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET),
    navigateCreateWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
  }),
)(WalletInitScreen)
