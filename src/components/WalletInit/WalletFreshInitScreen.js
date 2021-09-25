// @flow

import React from 'react'
import {View, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import WalletDescription from './WalletDescription'
import {Button, Spacer, StatusBar} from '../UiKit'
// uses same styles as WalletInitScreen
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {CONFIG, isNightly} from '../../config/config'
import {COLORS} from '../../styles/config'

import type {NetworkId, WalletImplementationId} from '../../config/types'
import {useNavigation} from '@react-navigation/native'

const messages = defineMessages({
  addWalletButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletButton',
    defaultMessage: '!!!Add wallet',
  },
  addWalletOnShelleyButton: {
    id: 'components.walletinit.walletfreshinitscreen.addWalletOnShelleyButton',
    defaultMessage: '!!!Add wallet (Shelley Testnet)',
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_BLUE,
  },
  banner: {
    flex: 1,
    justifyContent: 'center',
  },
  actions: {
    padding: 16,
  },
})
type Props = {
  intl: IntlShape,
}

const WalletInitScreen = ({intl}: Props) => {
  const navigation = useNavigation()
  const navigateInitWallet = (networkId: NetworkId, walletImplementationId: WalletImplementationId) =>
    navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
      networkId,
      walletImplementationId,
    })

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <View style={styles.banner}>
        <WalletDescription />
      </View>

      <Actions>
        <ShelleyButton
          title={`${intl.formatMessage(messages.addWalletButton)}`}
          onPress={() =>
            navigateInitWallet(
              CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
              CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
            )
          }
        />

        <Spacer height={16} />

        <ByronButton
          title={`${intl.formatMessage(messages.addWalletButton)} (Byron-era - deprecated)`}
          onPress={() =>
            navigateInitWallet(
              CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
              CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
            )
          }
        />

        <JormungandrOnly>
          <Spacer height={16} />
          <JormungandrButton
            title={intl.formatMessage(messages.addWalletOnShelleyButton)}
            onPress={() =>
              navigateInitWallet(
                CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
                CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
              )
            }
          />
        </JormungandrOnly>

        <NightlyOnly>
          <Spacer height={16} />
          <ShelleyTestnetButton
            title={`${intl.formatMessage(messages.addWalletButton)} on TESTNET (Shelley-era)`}
            onPress={() =>
              navigateInitWallet(
                CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
                CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
              )
            }
          />
        </NightlyOnly>
      </Actions>
    </SafeAreaView>
  )
}
export default injectIntl(WalletInitScreen)

const Actions = (props) => <View {...props} style={styles.actions} />

const ShelleyButton = (props) => <Button {...props} testID="addWalletOnHaskellShelleyButton" />
const ShelleyTestnetButton = (props) => <Button {...props} />
const ByronButton = (props) => <Button {...props} outline testID="addWalletOnByronButton" />
const JormungandrButton = (props) => <Button {...props} outline testID="addWalletOnShelleyButton" />

const NightlyOnly = ({children}) => (isNightly() ? children : null)
const JormungandrOnly = ({children}) => (CONFIG.NETWORKS.JORMUNGANDR.ENABLED ? children : null)
