// @flow

import React from 'react'
import {Text, ScrollView, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose, withHandlers, withStateHandlers} from 'recompose'
import _ from 'lodash'
import {SafeAreaView} from 'react-navigation'
import {injectIntl, defineMessages} from 'react-intl'
import type {IntlShape} from 'react-intl'

import walletManager, {
  SystemAuthDisabled,
  KeysAreInvalid,
} from '../../crypto/wallet'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {showErrorDialog, updateVersion} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'
import FailedWalletUpgradeModal from './FailedWalletUpgradeModal'
import {currentVersionSelector} from '../../selectors'
import {onDidMount} from '../../utils/renderUtils'

import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!Your wallets',
  },
  addWalletButton: {
    id: 'components.walletselection.walletselectionscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
  addWalletOnShelleyButton: {
    id:
      'components.walletselection.walletselectionscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Shelley Testnet)',
  },
})

const WalletListScreen = ({
  navigation,
  wallets,
  navigateInitWallet,
  openWallet,
  intl,
  showModal,
  setShowModal,
}) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    {/* eslint-disable indent */
    false && (
      <FailedWalletUpgradeModal
        visible={showModal}
        onPress={() => setShowModal(false)}
        onRequestClose={() => setShowModal(false)}
      />
    )
    /* eslint-enable indent */
    }

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
          onPress={(event) => navigateInitWallet(event, false)}
          title={intl.formatMessage(messages.addWalletButton)}
          style={styles.addWalletButton}
        />

        <Button
          outline
          onPress={(event) => navigateInitWallet(event, true)}
          title={intl.formatMessage(messages.addWalletOnShelleyButton)}
          style={styles.addWalletOnShelleyButton}
        />
      </ScreenBackground>
    </Screen>
  </SafeAreaView>
)

const walletsListSelector = (state) => Object.values(state.wallets)

export default injectIntl(
  (compose(
    connect(
      (state: State) => ({
        wallets: walletsListSelector(state),
        currentVersion: currentVersionSelector(state),
      }),
      {
        updateVersion,
      },
    ),
    withStateHandlers(
      {
        showModal: true,
      },
      {
        setShowModal: (state) => (value) => ({showModal: value}),
      },
    ),
    withHandlers({
      navigateInitWallet: ({navigation}) => (event, isShelleyWallet) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
          isShelleyWallet,
        }),
      openWallet: ({navigation, intl}) => async (wallet) => {
        try {
          await walletManager.openWallet(wallet.id)
          const route = wallet.isShelley
            ? ROOT_ROUTES.SHELLEY_WALLET
            : ROOT_ROUTES.WALLET
          navigation.navigate(route)
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
          } else if (e instanceof KeysAreInvalid) {
            await walletManager.cleanupInvalidKeys()
            await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
          } else {
            throw e
          }
        }
      },
    }),
    onDidMount(
      async ({setShowModal, wallets, currentVersion, updateVersion}) => {
        const currVersionInt =
          currentVersion != null
            ? parseInt(currentVersion.replace(/\./g, ''), 10)
            : 0
        if (
          wallets != null &&
          currVersionInt <= 204 &&
          _.some(wallets, {isShelley: true})
        ) {
          setShowModal(true)
        }
        // update version to make sure users won't see the dialog the next
        // time they open the app. Also, users that didn't see it in the first
        // place, shouldn't see it in the future either
        await updateVersion()
      },
    ),
  )(WalletListScreen): ComponentType<{
    intl: IntlShape,
    navigation: NavigationScreenProp<NavigationState>,
  }>),
)
