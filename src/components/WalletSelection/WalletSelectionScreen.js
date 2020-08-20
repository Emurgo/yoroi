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
} from '../../crypto/walletManager'
import {InvalidState} from '../../crypto/errors'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import {ROOT_ROUTES, WALLET_INIT_ROUTES} from '../../RoutesList'
import {showErrorDialog, updateVersion} from '../../actions'
import {errorMessages} from '../../i18n/global-messages'
import FailedWalletUpgradeModal from './FailedWalletUpgradeModal'
import {currentVersionSelector} from '../../selectors'
import {onDidMount} from '../../utils/renderUtils'
import {isJormungandr, NETWORKS} from '../../config/networks'
import {
  NETWORK_REGISTRY,
  WALLET_IMPLEMENTATION_REGISTRY,
} from '../../config/types'

import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'
import type {NetworkId, WalletImplementationId} from '../../config/types'

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
    defaultMessage: '!!!Add wallet (Jormungandr ITN)',
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

    <FailedWalletUpgradeModal
      visible={showModal}
      onPress={() => setShowModal(false)}
      onRequestClose={() => setShowModal(false)}
    />

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
          onPress={(event) =>
            navigateInitWallet(
              event,
              NETWORK_REGISTRY.HASKELL_SHELLEY,
              WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
            )
          }
          title={`${intl.formatMessage(messages.addWalletButton)} (Byron-era)`}
          style={styles.addWalletButton}
        />

        <Button
          outline
          onPress={(event) =>
            navigateInitWallet(
              event,
              NETWORK_REGISTRY.HASKELL_SHELLEY,
              WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY,
            )
          }
          title={`${intl.formatMessage(
            messages.addWalletButton,
          )} (Shelley-era)`}
          style={styles.addWalletOnShelleyButton}
        />

        {NETWORKS.JORMUNGANDR.ENABLED && (
          <Button
            outline
            onPress={(event) =>
              navigateInitWallet(
                event,
                NETWORK_REGISTRY.JORMUNGANDR,
                WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN,
              )
            }
            title={intl.formatMessage(messages.addWalletOnShelleyButton)}
            style={styles.addWalletOnShelleyButton}
          />
        )}
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
        showModal: false,
      },
      {
        setShowModal: (state) => (value) => ({showModal: value}),
      },
    ),
    withHandlers({
      navigateInitWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        walletImplementationId: WalletImplementationId,
      ) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
          networkId,
          walletImplementationId,
        }),
      openWallet: ({navigation, intl}) => async (wallet) => {
        try {
          if (wallet.isShelley || isJormungandr(wallet.networkId)) {
            await showErrorDialog(errorMessages.itnNotSupported, intl)
            return
          }
          await walletManager.openWallet(wallet)
          const route = ROOT_ROUTES.WALLET
          navigation.navigate(route)
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_INIT_ROUTES.WALLET_SELECTION)
          } else if (e instanceof InvalidState) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.walletStateInvalid, intl)
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
        // note: old wallets didn't have networkId but just an isShelley flag
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
