/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import * as React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {useLanguage} from '../../../../../i18n'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {useStrings} from '../../../common/strings'
import {useSwapForm} from '../../../common/SwapFormProvider'

const BORDER_SIZE = 1
const PRECISION = 14

export const EditLimitPrice = () => {
  const strings = useStrings()
  const {numberLocale} = useLanguage()
  const [text, setText] = React.useState('')
  const wallet = useSelectedWallet()
  const inputRef = React.useRef<TextInput>(null)

  const {orderData, limitPriceChanged} = useSwap()
  const sellTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})
  const buyTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})
  const denomination = (sellTokenInfo.decimals ?? 0) - (buyTokenInfo.decimals ?? 0)
  const disabled = orderData.type === 'market'

  const {
    buyAmount: {isTouched: isBuyTouched},
    sellAmount: {isTouched: isSellTouched},
  } = useSwapForm()

  const tokenToSellName = isSellTouched ? sellTokenInfo.ticker ?? sellTokenInfo.name : '-'
  const tokenToBuyName = isBuyTouched ? buyTokenInfo.ticker ?? buyTokenInfo.name : '-'

  React.useEffect(() => {
    if (orderData.type === 'limit') {
      !inputRef?.current?.isFocused() &&
        setText(Quantities.format(orderData.limitPrice ?? Quantities.zero, denomination, PRECISION))
    } else {
      setText(
        Quantities.format(orderData.selectedPoolCalculation?.prices.market ?? Quantities.zero, denomination, PRECISION),
      )
    }
  }, [orderData.type, orderData.limitPrice, orderData.amounts.sell, denomination, orderData.selectedPoolCalculation])

  const onChange = (text: string) => {
    const [formattedPrice, price] = Quantities.parseFromText(text, denomination, numberLocale, PRECISION)
    setText(formattedPrice)
    limitPriceChanged(price)
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Text style={styles.label}>{disabled ? strings.marketPrice : strings.limitPrice}</Text>

      <View style={styles.content}>
        <AmountInput onChange={onChange} value={text} editable={!disabled} inputRef={inputRef} />

        <View style={[styles.textWrapper, disabled && styles.disabled]}>
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
  inputRef?: React.RefObject<TextInput>
}
const AmountInput = ({onChange, value, editable, inputRef}: AmountInputProps) => {
  return (
    <TextInput
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
      ref={inputRef}
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
  },
  disabled: {
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
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  amountInput: {
    fontSize: 16,
    height: 56,
    paddingRight: 16,
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
