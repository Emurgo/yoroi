// @flow

import React from 'react'
import {TouchableOpacity, Text, View} from 'react-native'
import {compose, withHandlers} from 'recompose'
import LinearGradient from 'react-native-linear-gradient'

import CardanoIcon from '../../assets/CardanoIcon'
import {COLORS} from '../../styles/config'
import {isJormungandr} from '../../config/networks'

import styles from './styles/WalletListItem.style'

import type {WalletMeta} from '../../state'
import type {ComponentType} from 'react'

type ExternalProps = {
  wallet: WalletMeta,
  onPress: (WalletMeta) => any,
}

const WalletListItem = ({wallet, onPress}) => (
  <TouchableOpacity activeOpacity={0.5} onPress={onPress} style={styles.item}>
    {/* eslint-disable */
    isJormungandr(wallet.networkId) ? (
      <View>
        <LinearGradient
          start={{x: 0, y: 1}}
          end={{x: 1, y: 0}}
          colors={['#1A44B7', '#F14D78']}
          style={styles.icon}
        >
          <CardanoIcon height={28} width={28} color={COLORS.WHITE} />
        </LinearGradient>
      </View>
    ) : (
      <View style={styles.icon}>
        <CardanoIcon height={28} width={28} color={COLORS.WHITE} />
      </View>
    )
    /* eslint-enable */
    }
    <Text style={styles.nameText}>
      {wallet.name}
      {isJormungandr(wallet.networkId) && ' (ITN)'}
    </Text>
  </TouchableOpacity>
)

export default (compose(
  withHandlers({
    onPress: ({onPress, wallet}) => () => onPress(wallet),
  }),
)(WalletListItem): ComponentType<ExternalProps>)
