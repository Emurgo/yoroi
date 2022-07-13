import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Text} from '../../components'
import {getDefaultAssetByNetworkId} from '../../legacy/config'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {useStrings} from './strings'

export const Fee = ({fee}: {fee: BigNumber | null}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const defaultAsset = getDefaultAssetByNetworkId(wallet.networkId)

  const value = fee ? formatTokenWithSymbol(fee, defaultAsset) : strings.feeNotAvailable

  return (
    <Text style={styles.info}>
      {strings.feeLabel}
      {': '}
      {value}
    </Text>
  )
}

const styles = StyleSheet.create({
  info: {
    fontSize: 14,
    lineHeight: 22,
  },
})
