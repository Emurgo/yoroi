// @flow

import React from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import {compose, withHandlers} from 'recompose'

import AdaIcon from '../../assets/AdaIcon'
import CardanoIcon from '../../assets/CardanoIcon'
import {ROOT_ROUTES} from '../../RoutesList'
import {COLORS} from '../../styles/config'
import {formatAda} from '../../utils/format'

import styles from './styles/WalletListItem.style'

import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {Wallet} from './types'

type Props = {
  navigation: NavigationScreenProp<NavigationState>,
  wallet: Wallet,
  navigateLogin: () => mixed,
}

const WalletListItem = ({wallet, navigateLogin}: Props) => (
  <TouchableOpacity onPress={navigateLogin} style={styles.item}>
    <View style={styles.name}>
      <CardanoIcon height={28} width={28} color={COLORS.WHITE} />
      <Text style={styles.nameText}>{wallet.name}</Text>
    </View>
    <View style={styles.balance}>
      <Text style={styles.balanceText}>{formatAda(wallet.balance)}</Text>
      <AdaIcon height={14} width={14} color={COLORS.WHITE} />
    </View>
  </TouchableOpacity>
)

export default compose(
  withHandlers({
    navigateLogin: ({navigation, wallet}) => (event) =>
      navigation.navigate(ROOT_ROUTES.LOGIN, {walletId: wallet.id}),
  }),
)(WalletListItem)
