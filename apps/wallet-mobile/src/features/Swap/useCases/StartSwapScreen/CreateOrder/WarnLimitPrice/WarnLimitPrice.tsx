import {SwapState} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {useLanguage} from '../../../../../../kernel/i18n'
import {PRICE_PRECISION} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'

export interface LimitPriceWarningProps {
  onConfirm?: () => void
  orderData: SwapState['orderData']
}

export const WarnLimitPrice = ({onConfirm, orderData}: LimitPriceWarningProps) => {
  const strings = useStrings()
  const styles = useStyles()
  const {numberLocale} = useLanguage()
  const limitPrice = new BigNumber(orderData.limitPrice ?? 0)
    .shiftedBy(orderData.tokens.priceDenomination)
    .toFormat(PRICE_PRECISION, BigNumber.ROUND_DOWN, numberLocale)
  const {closeModal} = useModal()

  const tokenToSellName = orderData.amounts.sell?.info.ticker ?? orderData.amounts.sell?.info.name ?? '-'
  const tokenToBuyName = orderData.amounts.buy?.info.ticker ?? orderData.amounts.buy?.info.name ?? '-'
  const marketPrice = new BigNumber(orderData.selectedPoolCalculation?.prices.market ?? 0)
    .shiftedBy(orderData.tokens.priceDenomination)
    .toFormat(PRICE_PRECISION, BigNumber.ROUND_DOWN, numberLocale)

  const name = `${tokenToSellName}/${tokenToBuyName}`

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>{strings.limitPriceWarningDescription}</Text>

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

      <Spacer fill />

      <View style={styles.buttonsWrapper}>
        <Button
          testID="swapCancelButton"
          outlineShelley
          title={strings.limitPriceWarningBack}
          onPress={closeModal}
          containerStyle={styles.buttonContainer}
        />

        <Button
          testID="swapConfirmButton"
          shelleyTheme
          title={strings.limitPriceWarningConfirm}
          onPress={onConfirm}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <Spacer height={23} />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
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
      ...atoms.px_lg,
    },
    label: {
      color: color.gray_c600,
      ...atoms.body_1_lg_regular,
    },
    value: {
      color: color.gray_cmax,
      ...atoms.body_1_lg_regular,
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
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
  })

  return styles
}
