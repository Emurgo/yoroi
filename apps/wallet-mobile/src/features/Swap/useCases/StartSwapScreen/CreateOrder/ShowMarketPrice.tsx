/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {useStrings} from '../../../common/strings'
import {useSwapTouched} from './TouchedContext'

export const ShowMarketPrice = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()

  const {createOrder} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const tokenToSellName = isSellTouched ? tokenToSellInfo.ticker ?? tokenToSellInfo.name : '-'
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const tokenToBuyName = isBuyTouched ? tokenToBuyInfo.ticker ?? tokenToBuyInfo.name : '-'

  const price =
    isBuyTouched &&
    isSellTouched &&
    createOrder.selectedPool?.price !== undefined &&
    !Number.isNaN(createOrder.selectedPool.price)
      ? createOrder.selectedPool.price
      : 0

  const formattedPrice = new BigNumber(price).decimalPlaces(6).toString(10)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.marketPrice}</Text>

      <View style={styles.content}>
        <View style={styles.amountInput}>
          <AmountInput value={formattedPrice} />
        </View>

        <Spacer width={7} />

        <Text style={styles.text}>
          {tokenToSellName}/{tokenToBuyName}
        </Text>
      </View>
    </View>
  )
}

type AmountInputProps = {
  value?: string
}
const AmountInput = ({value}: AmountInputProps) => {
  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      autoComplete="off"
      value={value}
      placeholder="0"
      allowFontScaling
      selectionColor={COLORS.TRANSPARENT_BLACK}
      style={styles.amountInput}
      underlineColorAndroid="transparent"
      editable={false}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.TEXT_GRAY3,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 10,
    width: '100%',
    height: 56,
    backgroundColor: COLORS.BANNER_GREY,
  },

  label: {
    position: 'absolute',
    top: -7,
    left: 10,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 5,
    fontSize: 12,
    color: COLORS.ERROR_TEXT_COLOR_DARK,
  },

  amountInput: {
    flex: 1,
    paddingVertical: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  text: {
    fontSize: 16,
    color: COLORS.TEXT_INPUT,
  },
})
