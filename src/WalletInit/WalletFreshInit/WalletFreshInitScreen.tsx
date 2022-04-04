import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {CONFIG, isNightly} from '../../../legacy/config/config'
// uses same styles as WalletInitScreen
import {WALLET_INIT_ROUTES} from '../../../legacy/RoutesList'
import {Button, Spacer, StatusBar} from '../../components'
import {COLORS} from '../../theme'
import {NetworkId, WalletImplementationId} from '../../yoroi-wallets'
import {WalletDescription} from '../WalletDescription'

export const WalletFreshInitScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <View style={styles.banner}>
        <WalletDescription />
      </View>

      <Actions>
        <ShelleyButton title={strings.addWalletButton} onPress={navigateTo.shelley} />

        <Spacer height={16} />

        <ByronButton title={`${strings.addWalletButton} (Byron-era - deprecated)`} onPress={navigateTo.byron} />

        <JormungandrOnly>
          <Spacer height={16} />
          <JormungandrButton title={strings.addWalletOnShelleyButton} onPress={navigateTo.jormungandr} />
        </JormungandrOnly>

        <NightlyOnly>
          <Spacer height={16} />
          <ShelleyTestnetButton
            title={`${strings.addWalletButton} on TESTNET (Shelley-era)`}
            onPress={navigateTo.shelleyTestnet}
          />
        </NightlyOnly>
      </Actions>
    </SafeAreaView>
  )
}

const Actions = (props) => <View {...props} style={styles.actions} />

const ShelleyButton = (props) => <Button {...props} testID="addWalletOnHaskellShelleyButton" />
const ShelleyTestnetButton = (props) => <Button {...props} testID="addWalletTestnetShelleyButton" />
const ByronButton = (props) => <Button {...props} outline testID="addWalletOnByronButton" />
const JormungandrButton = (props) => <Button {...props} outline testID="addWalletOnShelleyButton" />

const NightlyOnly = ({children}) => (isNightly() ? children : null)
const JormungandrOnly = ({children}) => (CONFIG.NETWORKS.JORMUNGANDR.ENABLED ? children : null)

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

const useStrings = () => {
  const intl = useIntl()

  return {
    addWalletButton: intl.formatMessage(messages.addWalletButton),
    addWalletOnShelleyButton: intl.formatMessage(messages.addWalletOnShelleyButton),
  }
}

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

const useNavigateTo = () => {
  const navigation = useNavigation()

  const navigateInitWallet = (networkId: NetworkId, walletImplementationId: WalletImplementationId) =>
    navigation.navigate(WALLET_INIT_ROUTES.CREATE_RESTORE_SWITCH, {
      networkId,
      walletImplementationId,
    })

  return {
    shelley: () =>
      navigateInitWallet(
        CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
        CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
      ),
    byron: () =>
      navigateInitWallet(
        CONFIG.NETWORKS.HASKELL_SHELLEY.NETWORK_ID,
        CONFIG.WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
      ),
    jormungandr: () =>
      navigateInitWallet(
        CONFIG.NETWORKS.JORMUNGANDR.NETWORK_ID,
        CONFIG.WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
      ),
    shelleyTestnet: () =>
      navigateInitWallet(
        CONFIG.NETWORKS.HASKELL_SHELLEY_TESTNET.NETWORK_ID,
        CONFIG.WALLETS.HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID,
      ),
  }
}
