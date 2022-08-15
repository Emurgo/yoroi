import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Text} from '../../components'
import {getPrimaryAssetByNetworkId} from '../../legacy/config'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {Quantity} from '../../yoroi-wallets/types'
import {useStrings} from './strings'

export const Fee = ({fee}: {fee: Quantity | null}) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const primaryAsset = getPrimaryAssetByNetworkId(wallet.networkId)

  const value = fee !== null ? formatTokenWithSymbol(new BigNumber(fee), primaryAsset) : strings.feeNotAvailable

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
