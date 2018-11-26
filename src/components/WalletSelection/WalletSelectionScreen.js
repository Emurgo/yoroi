// @flow

import React from 'react'
import {Text, ScrollView, ActivityIndicator} from 'react-native'
import {connect} from 'react-redux'
import {compose, withHandlers} from 'recompose'
import _ from 'lodash'
import {SafeAreaView} from 'react-navigation'

import walletManager from '../../crypto/wallet'
import WalletListItem from './WalletListItem'
import Screen from '../Screen'
import {Button} from '../UiKit'
import {ROOT_ROUTES} from '../../RoutesList'
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
  <SafeAreaView style={styles.safeAreaView}>
    <Screen style={styles.container}>
      <Text style={styles.title}>{translations.header}</Text>

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
        title={translations.addWallet}
        style={styles.addWalletButton}
      />
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
      navigation.navigate(ROOT_ROUTES.NEW_WALLET),
    openWallet: ({navigation}) => async (wallet) => {
      await walletManager.openWallet(wallet.id)
      navigation.navigate(ROOT_ROUTES.WALLET)
    },
  }),
)(WalletListScreen): ComponentType<{
  navigation: NavigationScreenProp<NavigationState>,
}>)
