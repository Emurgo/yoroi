// @flow

import React from 'react'
import {Text, ScrollView, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import _ from 'lodash'
import {SafeAreaView} from 'react-native-safe-area-context'
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
import {
  WALLET_ROOT_ROUTES,
  WALLET_INIT_ROUTES,
  ROOT_ROUTES,
} from '../../RoutesList'
import {showErrorDialog, updateVersion} from '../../actions'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {currentVersionSelector} from '../../selectors'
import {onDidMount} from '../../utils/renderUtils'
import {CONFIG, isNightly} from '../../config/config'
import {isJormungandr} from '../../config/networks'

import styles from './styles/WalletSelectionScreen.style'

import type {State} from '../../state'
import type {ComponentType} from 'react'
import type {NetworkId, WalletImplementationId} from '../../config/types'

const messages = defineMessages({
  header: {
    id: 'components.walletselection.walletselectionscreen.header',
    defaultMessage: '!!!My wallets',
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
  wallets,
  navigateInitWallet,
  openWallet,
  intl,
}: {intl: IntlShape}  & Object /* TODO: type */ ) => (
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
          onPress={(event) =>
            // note: assume wallet implementation = yoroi haskell shelley
            // (15 words), but user may choose 24 words in next screen
            navigateInitWallet(
              event,
              CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
              CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            )
          }
          title={`${intl.formatMessage(
            messages.addWalletButton,
          )} (Shelley-era)`}
          style={styles.topButton}
        />

        {isNightly() && (
          <Button
            onPress={(event) =>
              // note: assume wallet implementation = yoroi haskell shelley
              // (15 words), but user may choose 24 words in next screen
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={`${intl.formatMessage(
              messages.addWalletButton,
            )} on TESTNET (Shelley-era)`}
            style={styles.button}
          />
        )}

        <Button
          outline
          onPress={(event) =>
            navigateInitWallet(
              event,
              CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
              CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
            )
          }
          title={`${intl.formatMessage(
            messages.addWalletButton,
          )} (Byron-era - ${intl.formatMessage(globalMessages.deprecated)})`}
          style={styles.button}
        />

        {CONFIG.NETWORKS.JORMUNGANDR.ENABLED && (
          <Button
            outline
            onPress={(event) =>
              navigateInitWallet(
                event,
                CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
                CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
              )
            }
            title={intl.formatMessage(messages.addWalletOnShelleyButton)}
            style={styles.button}
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
    withHandlers({
      navigateInitWallet: ({navigation}) => (
        event: Object,
        networkId: NetworkId,
        walletImplementationId: WalletImplementationId,
      ) =>
        navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
          screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
          params: {
            networkId,
            walletImplementationId,
          },
        }),
      openWallet: ({navigation, intl}) => async (wallet) => {
        try {
          if (wallet.isShelley || isJormungandr(wallet.networkId)) {
            await showErrorDialog(errorMessages.itnNotSupported, intl)
            return
          }
          await walletManager.openWallet(wallet)
          const route = WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES
          navigation.navigate(route)
        } catch (e) {
          if (e instanceof SystemAuthDisabled) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.enableSystemAuthFirst, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
          } else if (e instanceof InvalidState) {
            await walletManager.closeWallet()
            await showErrorDialog(errorMessages.walletStateInvalid, intl)
            navigation.navigate(WALLET_ROOT_ROUTES.WALLET_SELECTION)
          } else if (e instanceof KeysAreInvalid) {
            await walletManager.cleanupInvalidKeys()
            await showErrorDialog(errorMessages.walletKeysInvalidated, intl)
          } else {
            throw e
          }
        }
      },
    }),
    onDidMount(async ({updateVersion}) => {
      // if needed, one can add logic here for, e.g., notifying the user about
      // new features after an update

      await updateVersion()
    }),
  )(WalletListScreen): ComponentType<{
    intl: IntlShape,
    navigation: any, // TODO: type
  }>),
)
