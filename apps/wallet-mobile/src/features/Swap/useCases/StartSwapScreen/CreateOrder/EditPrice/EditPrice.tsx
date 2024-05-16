/* eslint-disable react/jsx-newline */
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../../WalletManager/Context/SelectedWalletContext'
import {PRICE_PRECISION} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'
import {useSwapForm} from '../../../../common/SwapFormProvider'
import {ShowPriceImpact} from './ShowPriceImpact'

const BORDER_SIZE = 1

export const EditPrice = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [isFocused, setIsFocused] = React.useState(false)
  const styles = useStyles()

  const {orderData} = useSwap()
  const sellTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})
  const buyTokenInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})
  const disabled = orderData.type === 'market'

  const prices = orderData.selectedPoolCalculation?.prices
  const formattedPrice = Quantities.format(
    orderData.selectedPoolCalculation?.prices.actualPrice ?? Quantities.zero,
    orderData.tokens.priceDenomination,
    PRICE_PRECISION,
  )

  const {
    buyQuantity: {isTouched: isBuyTouched},
    sellQuantity: {isTouched: isSellTouched},
    limitPrice: {displayValue: limitDisplayValue},
    limitInputRef,
    onChangeLimitPrice,
  } = useSwapForm()

  const tokenToSellName = isSellTouched ? sellTokenInfo.ticker ?? sellTokenInfo.name : '-'
  const tokenToBuyName = isBuyTouched ? buyTokenInfo.ticker ?? buyTokenInfo.name : '-'

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
            <Text style={styles.text}>
              {tokenToSellName}/{tokenToBuyName}
            </Text>
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
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      borderWidth: BORDER_SIZE,
      borderColor: color.gray[400],
      width: '100%',
      height: 56,
      paddingLeft: 16,
      paddingRight: 8,
    },
    disabled: {
      backgroundColor: color.gray[50],
    },
    active: {
      borderWidth: 2,
      borderColor: color.gray[900],
      zIndex: 2222,
    },
    label: {
      position: 'absolute',
      top: -7,
      left: 10,
      backgroundColor: color.gray.min,
      paddingHorizontal: 5,
      fontSize: 12,
      color: color.gray[900],
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
      color: color.gray.max,
    },
    text: {
      fontSize: 16,
      color: color.gray.max,
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
