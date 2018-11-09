// @flow

import React from 'react'
import {Text, View} from 'react-native'
import {connect} from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import {compose, withHandlers, withProps} from 'recompose'
import {BigNumber} from 'bignumber.js'

import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button} from '../UiKit'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {COLORS} from '../../styles/config'

import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {SubTranslation} from '../../l10n/typeHelpers'
import type {State} from '../../state'
import type {Wallet} from './types'

const MOCK_WALLETS = [
  {
    id: '1',
    name: 'Wallet 1',
    balance: new BigNumber(123456789, 10),
  },
  {
    id: '2',
    name: 'Wallet 2',
    balance: new BigNumber(987654321, 10),
  },
  {
    id: '3',
    name: 'Wallet 3',
    balance: new BigNumber(12345, 10),
  },
  {
    id: '4',
    name: 'Wallet 4',
    balance: new BigNumber(678, 10),
  },
]

const getTranslations = (state: State) => state.trans.WalletSelectionScreen

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  translations: SubTranslation<typeof getTranslations>,
  wallets: Array<Wallet>,
  navigateInitWallet: () => mixed,
}

const WalletListScreen = ({
  navigation,
  translations,
  wallets,
  navigateInitWallet,
}: Props) => (
  <Screen style={styles.container} bgColor={COLORS.TRANSPARENT}>
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={[COLORS.PRIMARY_GRADIENT_START, COLORS.PRIMARY_GRADIENT_END]}
      style={styles.gradient}
    >
      <Text style={styles.header}>{translations.header}</Text>

      <View style={styles.wallets}>
        {wallets.map((wallet) => (
          <WalletListItem
            key={wallet.id}
            wallet={wallet}
            navigation={navigation}
          />
        ))}
      </View>

      <Button
        onPress={navigateInitWallet}
        title={translations.addWallet}
        style={styles.addWalletButton}
      />
    </LinearGradient>
  </Screen>
)

export default compose(
  connect((state: State) => ({
    translations: getTranslations(state),
  })),
  withProps({
    wallets: MOCK_WALLETS,
  }),
  withHandlers({
    navigateInitWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.INIT),
  }),
)(WalletListScreen)
