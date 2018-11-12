// @flow

import React from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import {compose, withHandlers} from 'recompose'

import CardanoIcon from '../../assets/CardanoIcon'
import {COLORS} from '../../styles/config'

import styles from './styles/WalletListItem.style'

import type {Wallet} from './types'
import type {ComponentType} from 'react'

type ExternalProps = {
  wallet: Wallet,
  onPress: (Wallet) => any,
}

const WalletListItem = ({wallet, onPress}) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <View style={styles.name}>
      <CardanoIcon height={28} width={28} color={COLORS.WHITE} />
      <Text style={styles.nameText}>{wallet.name}</Text>
    </View>
  </TouchableOpacity>
)

export default (compose(
  withHandlers({
    onPress: ({onPress, wallet}) => () => onPress(wallet),
  }),
)(WalletListItem): ComponentType<ExternalProps>)
