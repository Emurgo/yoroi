import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {asQuantity, Quantities} from '../../../../../../yoroi-wallets/utils/utils'
import {PRICE_PRECISION} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'
import {ShowPriceImpact} from './ShowPriceImpact'

const BORDER_SIZE = 1

export const EditPrice = () => {
  const strings = useStrings()
  const [isFocused, setIsFocused] = React.useState(false)
  const styles = useStyles()

  const {orderData} = useSwap()
  const sellTokenInfo = orderData.amounts.sell?.info
  const buyTokenInfo = orderData.amounts.buy?.info
  const disabled = orderData.type === 'market'

  const prices = orderData.selectedPoolCalculation?.prices
  const formattedPrice = Quantities.format(
    asQuantity(orderData.selectedPoolCalculation?.prices.actualPrice ?? Quantities.zero),
    orderData.tokens.priceDenomination,
    PRICE_PRECISION,
  )

  const {
    limitPrice: {displayValue: limitDisplayValue},
    limitInputRef,
    onChangeLimitPrice,
  } = useSwapForm()

  const tokenToSellName = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'
  const tokenToBuyName = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
  const pair = `${tokenToSellName}/${tokenToBuyName}`

  return (
    <>
      <View style={[styles.container, disabled && styles.disabled, isFocused && styles.active]}>
        <Text style={styles.label}>{disabled ? strings.marketPrice : strings.limitPrice}</Text>

        <View style={styles.content}>
          <TextInput
            keyboardType="numeric"
            autoComplete="off"
            value={limitDisplayValue}
            placeholder="0"
            onChangeText={onChangeLimitPrice}
            allowFontScaling
            selectionColor="#242838"
            style={styles.amountInput}
            underlineColorAndroid="transparent"
            editable={!disabled}
            ref={limitInputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <View style={[styles.textWrapper, disabled && styles.disabled]}>
            <Text style={styles.text}>{pair}</Text>
          </View>
        </View>
      </View>

      {orderData.type === 'market' && (
        <ShowPriceImpact
          priceImpact={Number(prices?.priceImpact)}
          formattedPrice={formattedPrice}
          pair={`${tokenToSellName}/${tokenToBuyName}`}
        />
      )}
    </>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      borderWidth: BORDER_SIZE,
      borderColor: color.gray_c400,
      width: '100%',
      height: 56,
      paddingLeft: 16,
      paddingRight: 8,
    },
    disabled: {
      backgroundColor: color.gray_c50,
    },
    active: {
      borderWidth: 2,
      borderColor: color.gray_c900,
      zIndex: 2222,
    },
    label: {
      position: 'absolute',
      top: -7,
      left: 10,
      backgroundColor: color.bg_color_high,
      paddingHorizontal: 5,
      fontSize: 12,
      color: color.gray_c900,
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
      color: color.gray_cmax,
    },
    text: {
      fontSize: 16,
      color: color.gray_cmax,
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
    },
  })
  return styles
}
