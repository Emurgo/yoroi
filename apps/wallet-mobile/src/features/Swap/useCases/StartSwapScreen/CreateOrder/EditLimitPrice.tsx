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
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {useStrings} from '../../../common/strings'
import {useSwapTouched} from './TouchedContext'

export const EditLimitPrice = () => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()

  const wallet = useSelectedWallet()

  const {createOrder} = useSwap()
  // TODO: limitChanged should be defined in useSwap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const limitChanged = (_todo: any) => null

  const {isBuyTouched, isSellTouched} = useSwapTouched()

  const price =
    isBuyTouched &&
    isSellTouched &&
    createOrder.selectedPool?.price !== undefined &&
    !Number.isNaN(createOrder.selectedPool.price)
      ? createOrder.selectedPool.price
      : 0

  const formattedPrice = new BigNumber(price).decimalPlaces(6).toString(10)

  const [inputValue, setInputValue] = React.useState(formattedPrice)

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const tokenToSellName = isSellTouched ? tokenToSellInfo.ticker ?? tokenToSellInfo.name : '-'
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const tokenToBuyName = isBuyTouched ? tokenToBuyInfo.ticker ?? tokenToBuyInfo.name : '-'

  const onChange = (text: string) => {
    const [input, quantity] = Quantities.parseFromText(text, 6, numberLocale)
    setInputValue(input)
    // TODO: Use a parseFromText that doesn't return quantity, as we just need a number
    limitChanged(quantity)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.limitPrice}</Text>

      <View style={styles.content}>
        <View style={styles.amountInput}>
          <AmountInput onChange={onChange} value={inputValue} editable={isBuyTouched && isSellTouched} />
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
    borderWidth: 1,
    borderColor: COLORS.TEXT_GRAY3,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 10,
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
