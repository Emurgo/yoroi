// @flow

import React from 'react'
import {Text, View, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import {compose, withHandlers, withState} from 'recompose'
import _ from 'lodash'

import walletManager from '../../crypto/wallet'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button} from '../UiKit'
import {WALLET_INIT_ROUTES, ROOT_ROUTES} from '../../RoutesList'
import {COLORS} from '../../styles/config'
import {onDidMount} from '../../utils/renderUtils'
import styles from './styles/WalletSelectionScreen.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {State} from '../../state'
import type {ComponentType} from 'react'

const getTranslations = (state: State) => state.trans.WalletSelectionScreen

const WalletListScreen = ({
  navigation,
  translations,
  wallets,
  navigateInitWallet,
  openWallet,
}) => (
  <Screen style={styles.container} bgColor={COLORS.TRANSPARENT}>
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={[COLORS.PRIMARY_GRADIENT_START, COLORS.PRIMARY_GRADIENT_END]}
      style={styles.gradient}
    >
      <Text style={styles.header}>{translations.header}</Text>

      <View style={styles.wallets}>
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
      </View>

      <Button
        onPress={navigateInitWallet}
        title={translations.addWallet}
        style={styles.addWalletButton}
      />
    </LinearGradient>
  </Screen>
)

export default (compose(
  connect((state: State) => ({
    translations: getTranslations(state),
  })),
  withState('wallets', 'setWallets', null),
  withHandlers({
    navigateInitWallet: ({navigation}) => (event) =>
      navigation.navigate(WALLET_INIT_ROUTES.INIT),
    fetchWallets: ({setWallets}) => () => {
      walletManager.listWallets().then(setWallets)
    },
    openWallet: ({navigation}) => async (wallet) => {
      await walletManager.openWallet(wallet.id)
      navigation.navigate(ROOT_ROUTES.WALLET)
    },
  }),
  onDidMount(({fetchWallets}) => fetchWallets()),
)(WalletListScreen): ComponentType<{
  navigation: NavigationScreenProp<NavigationState>,
}>)
