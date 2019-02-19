// @flow

import React from 'react'
import {Text, ScrollView, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import _ from 'lodash'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'

import walletManager, {
  SystemAuthDisabled,
  KeysAreInvalid,
} from '../../crypto/wallet'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {showErrorDialog} from '../../actions'

import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.WalletSelectionScreen

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: 'WWWWWW',
    description: "some ddesc",
  },
})

const WalletListScreen = ({
  navigation,
  translations,
  wallets,
  navigateInitWallet,
  openWallet,
  intl
}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <Screen style={styles.container}>
      <ScreenBackground>
        <Text style={styles.title}>{intl.formatMessage(messages.header)}</Text>

        <ScrollView style={styles.wallets}>
          {wallets ? (
            _.sortBy(wallets, ({name}) => name).map((wallet) => (
              <WalletListItem
                key={wallet.id}
                wallet={wallet}
                onPress={openWallet}
              />
            ))
          ) : (
            <ActivityIndicator />
          )}
        </ScrollView>

        <Button
          onPress={navigateInitWallet}
          title={translations.addWalletButton}
          style={styles.addWalletButton}
        />
      </ScreenBackground>
    </Screen>
  </SafeAreaView>
)

const walletsListSelector = (state) => Object.values(state.wallets)

export default (compose(
  connect((state: State) => ({
    translations: getTranslations(state),
    wallets: walletsListSelector(state),
  })),
  withHandlers({
    navigateInitWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH),
    openWallet: ({navigation}) => async (wallet) => {
      try {
        await walletManager.openWallet(wallet.id)
        navigation.navigate(ROOT_ROUTES.WALLET)
      } catch (e) {
        if (e instanceof SystemAuthDisabled) {
          await walletManager.closeWallet()
          await showErrorDialog((dialogs) => dialogs.enableSystemAuthFirst)
          navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
        } else if (e instanceof KeysAreInvalid) {
          await walletManager.cleanupInvalidKeys()
          await showErrorDialog((dialogs) => dialogs.walletKeysInvalidated)
        } else {
          throw e
        }
      }
    },
  }),
)(injectIntl(WalletListScreen)): ComponentType<{
  navigation: NavigationScreenProp<NavigationState>,
}>)
