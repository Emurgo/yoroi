import {SwapState} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../../../components/Button/Button'
import {useModal} from '../../../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {useLanguage} from '../../../../../../kernel/i18n'
import {PRICE_PRECISION} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'

interface LimitPriceWarningProps {
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
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    buttonContainer: {
      ...atoms.flex_1,
    },
    buttonsWrapper: {
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.pt_lg,
    },
    container: {
      ...atoms.justify_between,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    label: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    value: {
      color: color.text_gray_max,
      ...atoms.body_1_lg_regular,
      ...atoms.text_right,
    },
    textWrapper: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_end,
      ...atoms.flex_wrap,
      ...atoms.gap_xs,
    },
    table: {
      ...atoms.flex_col,
      ...atoms.gap_sm,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_md,
    },
    description: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
  })

  return styles
}
