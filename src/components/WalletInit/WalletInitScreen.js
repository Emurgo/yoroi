// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import WalletDescription from './WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {walletIsInitializedSelector} from '../../selectors'

import type {State} from '../../state'
import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add wallet',
    description: 'some desc',
  },
  createWalletButton: {
    id: 'components.walletinit.walletinitscreen.createWalletButton',
    defaultMessage: '!!!Create wallet',
    description: 'some desc',
  },
  restoreWalletButton: {
    id: 'components.walletinit.walletinitscreen.restoreWalletButton',
    defaultMessage: '!!!Restore wallet',
    description: 'some desc',
  },
})

type Props = {
  navigateRestoreWallet: (Object, boolean) => mixed,
  navigateCreateWallet: (Object, boolean) => mixed,
  intl: any,
  walletIsInitialized: boolean,
  navigation: Navigation,
}

const WalletInitScreen = ({
  navigateCreateWallet,
  navigateRestoreWallet,
  intl,
  walletIsInitialized,
  navigation,
}: Props) => {
  const isShelleyWallet = navigation.getParam('isShelleyWallet')
  let createWalletLabel = intl.formatMessage(messages.createWalletButton)
  let restoreWalletLabel = intl.formatMessage(messages.restoreWalletButton)
  if (isShelleyWallet) {
    createWalletLabel += ' (Shelley Testnet)'
    restoreWalletLabel += ' (Shelley Testnet)'
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.content}>
            <WalletDescription />
          </View>
          <Button
            onPress={(event) => navigateCreateWallet(event, isShelleyWallet)}
            title={createWalletLabel}
            style={styles.createButton}
            testID="createWalletButton"
          />
          <Button
            outline
            onPress={(event) => navigateRestoreWallet(event, isShelleyWallet)}
            title={restoreWalletLabel}
            style={styles.createButton}
            testID="restoreWalletButton"
          />
        </View>
      </ScreenBackground>
    </SafeAreaView>
  )
}
export default injectIntl(
  compose(
    connect((state: State) => ({
      walletIsInitialized: walletIsInitializedSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateRestoreWallet: ({navigation}) => (event, isShelleyWallet) =>
        navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET, {
          isShelleyWallet,
        }),
      navigateCreateWallet: ({navigation}) => (event, isShelleyWallet) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET, {
          isShelleyWallet,
        }),
    }),
  )(WalletInitScreen),
)
