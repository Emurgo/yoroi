/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {useStrings} from '../../../common/strings'

export const EditLimitPrice = () => {
  const strings = useStrings()

  const wallet = useSelectedWallet()

  const {createOrder} = useSwap()
  const [inputValue, setInputValue] = React.useState(String(createOrder.selectedPool?.price))

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const tokenToSellName = tokenToSellInfo.ticker ?? tokenToSellInfo.name
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const tokenToBuyName = tokenToBuyInfo.ticker ?? tokenToBuyInfo.name

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{strings.limitPrice}</Text>

        <View style={styles.content}>
          <View style={styles.amountInput}>
            <AmountInput onChange={setInputValue} value={inputValue} />
          </View>

          <Spacer width={7} />

          <Text style={styles.text}>
            {tokenToSellName}/{tokenToBuyName}
          </Text>
        </View>
      </View>
    </>
  )
}

type AmountInputProps = {
  value?: string
  onChange(value: string): void
}
const AmountInput = ({onChange, value}: AmountInputProps) => {
  // TODO add more formatting if is the case
  const onChangeText = (text: string) => {
    onChange(text)
  }

  return (
    <TextInput
      returnKeyType="done"
      keyboardType="numeric"
      autoComplete="off"
      value={value}
      placeholder="0"
      onChangeText={onChangeText}
      allowFontScaling
      selectionColor={COLORS.TRANSPARENT_BLACK}
      style={styles.amountInput}
      underlineColorAndroid="transparent"
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
