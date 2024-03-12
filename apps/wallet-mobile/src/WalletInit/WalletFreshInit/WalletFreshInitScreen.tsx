import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonProps, Spacer} from '../../components'
import {isNightly} from '../../legacy/config'
import {WalletInitRouteNavigation} from '../../navigation'
import {COLORS} from '../../theme'
import {useStatusBar} from '../../theme/hooks'
import * as HASKELL_SHELLEY from '../../yoroi-wallets/cardano/constants/mainnet/constants'
import * as HASKELL_SHELLEY_TESTNET from '../../yoroi-wallets/cardano/constants/testnet/constants'
import {NetworkId, WALLET_IMPLEMENTATION_REGISTRY, WalletImplementationId} from '../../yoroi-wallets/types'
import {WalletDescription} from '../WalletDescription'

export const WalletFreshInitScreen = () => {
  const strings = useStrings()
  const navigateTo = useNavigateTo()
  useStatusBar()

  return (
    <SafeAreaView edges={['left', 'right', 'top', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.banner}>
        <WalletDescription />
      </View>

      <Actions>
        <ShelleyButton title={strings.addWalletButton} onPress={navigateTo.shelley} />

        <Spacer height={16} />

        <ByronButton title={`${strings.addWalletButton} (Byron-era - deprecated)`} onPress={navigateTo.byron} />

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

const Actions = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.actions]} />

const ShelleyButton = (props: ButtonProps) => <Button {...props} testID="addWalletOnHaskellShelleyButton" />
const ShelleyTestnetButton = (props: ButtonProps) => <Button {...props} testID="addWalletTestnetShelleyButton" />
const ByronButton = (props: ButtonProps) => <Button {...props} outline testID="addWalletOnByronButton" />
const NightlyOnly = ({children}: {children: React.ReactNode}) => <>{isNightly() ? children : null}</>

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
  const navigation = useNavigation<WalletInitRouteNavigation>()

  const navigateInitWallet = (networkId: NetworkId, walletImplementationId: WalletImplementationId) =>
    navigation.navigate('choose-create-restore', {
      networkId,
      walletImplementationId,
    })

  return {
    shelley: () => navigateInitWallet(HASKELL_SHELLEY.NETWORK_ID, HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID),
    byron: () => navigateInitWallet(HASKELL_SHELLEY.NETWORK_ID, WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON),
    shelleyTestnet: () =>
      navigateInitWallet(HASKELL_SHELLEY_TESTNET.NETWORK_ID, HASKELL_SHELLEY_TESTNET.WALLET_IMPLEMENTATION_ID),
  }
}
