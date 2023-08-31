/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React, {useState} from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useLanguage} from '../../../../../i18n'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {useStrings} from '../../../common/strings'
import {useSwapTouched} from './TouchedContext'
import {BalanceQuantity} from '@yoroi/types/lib/balance/token'
const BORDER_SIZE = 1
const PRECISION = 6

export const EditLimitPrice = () => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()

  const wallet = useSelectedWallet()

  const {createOrder, limitPriceChanged} = useSwap()
  const limitChanged = (limitPrice: BalanceQuantity) => limitPriceChanged(limitPrice)

  const {isBuyTouched, isSellTouched} = useSwapTouched()

  const defaultPrice =
    isBuyTouched &&
    isSellTouched &&
    createOrder.selectedPool?.price !== undefined &&
    !Number.isNaN(createOrder.selectedPool.price)
      ? createOrder.selectedPool.price
      : 0

  const limitPrice = createOrder.limitPrice ? BigNumber(createOrder.limitPrice).toNumber() : defaultPrice

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const tokenToSellName = isSellTouched ? tokenToSellInfo.ticker ?? tokenToSellInfo.name : '-'
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const tokenToBuyName = isBuyTouched ? tokenToBuyInfo.ticker ?? tokenToBuyInfo.name : '-'

  const onChange = (text: string) => {
    const [, quantity] = Quantities.parseFromText(text, PRECISION, numberLocale)
    const value = Quantities.denominated(quantity, PRECISION)
    limitChanged(value)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.limitPrice}</Text>

      <View style={styles.content}>
        <AmountInput onChange={onChange} value={BigNumber(limitPrice).toFormat(PRECISION, numberLocale)} editable />

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
  onChange(value: string): void
  editable: boolean
}
const AmountInput = ({onChange, value, editable}: AmountInputProps) => {
  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChange}
      allowFontScaling
      selectionColor={COLORS.TRANSPARENT_BLACK}
      style={styles.amountInput}
      underlineColorAndroid="transparent"
      editable={editable}
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
  flex: {
    flex: 1,
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  amountInput: {
    fontSize: 16,
    height: 56,
    padding: 8,
  },
  text: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Rubik-Regular',
  },
  textWrapper: {
    position: 'absolute',
    top: 0,
    right: 8,
    paddingLeft: 8,
    backgroundColor: '#FFFFFF',
    height: 56 - BORDER_SIZE * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
