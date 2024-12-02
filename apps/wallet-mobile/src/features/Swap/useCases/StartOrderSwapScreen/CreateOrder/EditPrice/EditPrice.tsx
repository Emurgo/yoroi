import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TextInput, View} from 'react-native'

import {useStrings} from '../../../../common/strings'
import {useSwap} from '../../../../common/SwapProvider'
import {ShowPriceImpact} from './ShowPriceImpact'

const BORDER_SIZE = 1

export const EditPrice = () => {
  const strings = useStrings()
  const [isFocused, setIsFocused] = React.useState(false)
  const {styles, colors} = useStyles()
  const {isDark} = useTheme()

  const swapForm = useSwap()
  const sellTokenInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? 'unkown.')
  const buyTokenInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? 'unkown.')
  const disabled = swapForm.orderType === 'market'

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
            value={disabled ? String(swapForm.estimate?.netPrice ?? 0) : swapForm.wantedPrice.displayValue}
            placeholder="0"
            onChangeText={(value) => swapForm.dispatch({type: 'WantedPriceInputChanged', value})}
            allowFontScaling
            selectionColor={colors.cursor}
            style={styles.amountInput}
            underlineColorAndroid="transparent"
            editable={!disabled}
            ref={swapForm.wantedPriceInputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardAppearance={isDark ? 'dark' : 'light'} // ios feature
          />

          <View style={[styles.textWrapper, disabled && styles.disabled]}>
            <Text style={styles.text}>{pair}</Text>
          </View>
        </View>
      </View>

      {swapForm.orderType === 'market' && (
        <ShowPriceImpact
          priceImpact={Number(swapForm.estimate?.splits[0].priceImpact)}
          formattedPrice={String(swapForm.estimate?.splits[0].priceImpact ?? 0)}
          pair={pair}
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
      borderColor: color.gray_400,
      width: '100%',
      height: 56,
      paddingLeft: 16,
      paddingRight: 8,
    },
    disabled: {
      backgroundColor: color.gray_50,
    },
    active: {
      borderWidth: 2,
      borderColor: color.gray_900,
      zIndex: 2222,
    },
    label: {
      position: 'absolute',
      top: -7,
      left: 10,
      backgroundColor: color.bg_color_max,
      paddingHorizontal: 5,
      fontSize: 12,
      color: color.gray_900,
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
      color: color.gray_max,
    },
    text: {
      fontSize: 16,
      color: color.gray_max,
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
  const colors = {
    cursor: color.input_selected,
  }
  return {styles, colors} as const
}
