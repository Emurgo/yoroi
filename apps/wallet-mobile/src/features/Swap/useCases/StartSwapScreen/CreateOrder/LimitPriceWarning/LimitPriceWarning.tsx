import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer} from '../../../../../../components'
import {BottomSheetModal} from '../../../../../../components/BottomSheetModal'
import {useLanguage} from '../../../../../../i18n'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {useStrings} from '../../../../common/strings'

export interface LimitPriceWarningProps {
  open: boolean
  onClose?: () => void
  onSubmit?: () => void
}

export const LimitPriceWarning = ({open, onClose, onSubmit}: LimitPriceWarningProps) => {
  const {createOrder} = useSwap()
  const {numberLocale} = useLanguage()
  const strings = useStrings()
  const limitPrice = BigNumber(createOrder.limitPrice ?? 0).toFormat(numberLocale)
  const marketPrice = BigNumber(
    createOrder.selectedPool?.price !== undefined && !Number.isNaN(createOrder.selectedPool.price)
      ? createOrder.selectedPool.price
      : 0,
  ).toFormat(10, numberLocale)
  const wallet = useSelectedWallet()

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.sell.tokenId})
  const tokenToSellName = tokenToSellInfo.ticker ?? tokenToSellInfo.name ?? '-'
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: createOrder.amounts.buy.tokenId})
  const tokenToBuyName = tokenToBuyInfo.ticker ?? tokenToBuyInfo.name ?? '-'

  const limitValue = `${limitPrice} ${tokenToSellName}/${tokenToBuyName}`
  const marketValue = `${marketPrice} ${tokenToSellName}/${tokenToBuyName}`

  return (
    <BottomSheetModal
      title={strings.limitPriceWarningTitle}
      content={
        <View style={styles.container}>
          <View>
            <Text>{strings.limitPriceWarningDescription}</Text>

            <Spacer height={16} />

            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.label}>{strings.limitPriceWarningYourPrice}</Text>

                <Text style={styles.value}>{limitValue}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{strings.limitPriceWarningMarketPrice}</Text>

                <Text style={styles.value}>{marketValue}</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonsWrapper}>
            <Button
              testID="swapCancelButton"
              outlineShelley
              title={strings.limitPriceWarningBack}
              onPress={onClose}
              containerStyle={styles.buttonContainer}
            />

            <Button
              testID="swapConfirmButton"
              shelleyTheme
              title={strings.limitPriceWarningConfirm}
              onPress={onSubmit}
              containerStyle={styles.buttonContainer}
            />
          </View>
        </View>
      }
      isOpen={open}
      onClose={onClose}
    />
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
  },
  buttonsWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    color: '#6B7384',
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
  },
  value: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    fontFamily: 'Rubik-Regular',
    flexWrap: 'wrap',
    flex: 1,
    textAlign: 'right',
  },
  table: {
    flexDirection: 'column',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
})
