// @flow

import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {showErrorDialog, updateVersion} from '../../actions'
import {CONFIG, isNightly} from '../../config/config'
import {isJormungandr} from '../../config/networks'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../../config/types'
import {InvalidState} from '../../crypto/errors'
import walletManager, {KeysAreInvalid, SystemAuthDisabled} from '../../crypto/walletManager'
import globalMessages, {errorMessages} from '../../i18n/global-messages'
import {ROOT_ROUTES, WALLET_INIT_ROUTES, WALLET_ROOT_ROUTES} from '../../RoutesList'
import {walletsListSelector} from '../../selectors'
import Screen from '../Screen'
import {Button, ScreenBackground, StatusBar} from '../UiKit'
import styles from './styles/WalletSelectionScreen.style'
import WalletListItem from './WalletListItem'

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
    id: 'components.walletselection.walletselectionscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Jormungandr ITN)',
  },
})

const WalletListScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const wallets = useSelector(walletsListSelector)

  const openWallet = async (wallet) => {
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
  }

  const navigateInitWallet = (
    event: Object,
    networkId: NetworkId,
    walletImplementationId: WalletImplementationId,
    provider: ?YoroiProvider,
  ) =>
    navigation.navigate(ROOT_ROUTES.NEW_WALLET, {
      screen: WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH,
      params: {
        networkId,
        walletImplementationId,
        provider,
      },
    })

  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(updateVersion())
  }, [dispatch])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <Screen style={styles.container}>
        <ScreenBackground>
          <Text style={styles.title}>{intl.formatMessage(messages.header)}</Text>

          <ScrollView style={styles.wallets}>
            {wallets ? (
              _.sortBy(wallets, ({name}) => name).map((wallet) => (
                <WalletListItem key={wallet.id} wallet={wallet} onPress={openWallet} />
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
            title={`${intl.formatMessage(messages.addWalletButton)} (Shelley-era)`}
            style={styles.topButton}
          />

          {(isNightly() || CONFIG.IS_TESTNET_BUILD) && (
            <Button
              onPress={(event) =>
                // note: assume wallet implementation = yoroi haskell shelley
                // (15 words), but user may choose 24 words in next screen
                navigateInitWallet(
                  event,
                  CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
                  CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
                  'emurgo-alonzo',
                )
              }
              title={`${intl.formatMessage(messages.addWalletButton)} on TESTNET (Alonzo-era)`}
              style={styles.button}
            />
          )}

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
              title={`${intl.formatMessage(messages.addWalletButton)} on TESTNET (Shelley-era)`}
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
            title={`${intl.formatMessage(messages.addWalletButton)} (Byron-era - ${intl.formatMessage(
              globalMessages.deprecated,
            )})`}
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
}

export default WalletListScreen
