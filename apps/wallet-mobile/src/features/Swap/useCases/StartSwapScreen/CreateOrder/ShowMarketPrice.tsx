/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useLanguage} from '../../../../../i18n'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {useStrings} from '../../../common/strings'
import {useSwapTouched} from './TouchedContext'

const BORDER_SIZE = 1
export const ShowMarketPrice = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()
  const {numberLocale} = useLanguage()
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

  const formattedValue = BigNumber(price).toFormat(numberLocale)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.marketPrice}</Text>

      <View style={styles.content}>
        <AmountInput value={formattedValue} />

        <Spacer width={7} />

        <View style={styles.textWrapper}>
          <Text style={styles.text}>
            {tokenToSellName}/{tokenToBuyName}
          </Text>
        </View>
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
    borderWidth: BORDER_SIZE,
    borderColor: COLORS.TEXT_GRAY3,
    width: '100%',
    height: 56,
    paddingLeft: 16,
    paddingRight: 8,
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
    fontSize: 16,
    height: 56,
    paddingRight: 16,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  text: {
    fontSize: 16,
    color: COLORS.TEXT_INPUT,
    fontFamily: 'Rubik-Regular',
  },
  textWrapper: {
    position: 'absolute',
    top: 0,
    right: 8,
    paddingLeft: 8,
    height: 56 - BORDER_SIZE * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BANNER_GREY,
  },
})
