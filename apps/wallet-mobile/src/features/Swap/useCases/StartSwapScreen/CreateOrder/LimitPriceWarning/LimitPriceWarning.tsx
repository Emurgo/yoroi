import {useSwap} from '@yoroi/swap'
import BigNumber from 'bignumber.js'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer} from '../../../../../../components'
import {useLanguage} from '../../../../../../i18n'
import {BottomSheetModal} from '../../../../../../legacy/BottomSheetModal'
import {useSelectedWallet} from '../../../../../../SelectedWallet'
import {useTokenInfo} from '../../../../../../yoroi-wallets/hooks'
import {useStrings} from '../../../../common/strings'

export interface LimitPriceWarningProps {
  open: boolean
  onClose?: () => void
  onSubmit?: () => void
}

export const LimitPriceWarning = ({open, onClose, onSubmit}: LimitPriceWarningProps) => {
  const {orderData} = useSwap()
  const {numberLocale} = useLanguage()
  const strings = useStrings()
  const limitPrice = new BigNumber(orderData.limitPrice ?? 0).toFormat(numberLocale)
  const marketPrice = new BigNumber(orderData.selectedPoolCalculation?.prices.market ?? 0).toFormat(numberLocale)
  const wallet = useSelectedWallet()

  const tokenToSellInfo = useTokenInfo({wallet, tokenId: orderData.amounts.sell.tokenId})
  const tokenToSellName = tokenToSellInfo.ticker ?? tokenToSellInfo.name ?? '-'
  const tokenToBuyInfo = useTokenInfo({wallet, tokenId: orderData.amounts.buy.tokenId})
  const tokenToBuyName = tokenToBuyInfo.ticker ?? tokenToBuyInfo.name ?? '-'

  const name = `${tokenToSellName}/${tokenToBuyName}`

  return (
    <BottomSheetModal title={strings.limitPriceWarningTitle} isOpen={open} onClose={onClose}>
      <View style={styles.container}>
        <View>
          <Text>{strings.limitPriceWarningDescription}</Text>

          <Spacer height={16} />

          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.label}>{strings.limitPriceWarningYourPrice}</Text>

              <View style={styles.textWrapper}>
                <Text style={styles.value}>{limitPrice}</Text>

                <Text style={styles.value}>{name}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>{strings.limitPriceWarningMarketPrice}</Text>

              <View style={styles.textWrapper}>
                <Text style={styles.value}>{marketPrice}</Text>

                <Text style={styles.value}>{name}</Text>
              </View>
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
    </BottomSheetModal>
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
    textAlign: 'right',
  },
  textWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flex: 1,
    flexWrap: 'wrap',
    gap: 4,
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
