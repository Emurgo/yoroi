import {BigNumber} from 'bignumber.js'
import React from 'react'
import {StyleSheet} from 'react-native'
import {useSelector} from 'react-redux'

import {defaultNetworkAssetSelector} from '../../../legacy/selectors'
import {formatTokenWithSymbol} from '../../../legacy/utils/format'
import {Text} from '../../components'
import {useStrings} from './strings'

export const Fee = ({fee}: {fee: BigNumber | null}) => {
  const strings = useStrings()
  const defaultAsset = useSelector(defaultNetworkAssetSelector)

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
