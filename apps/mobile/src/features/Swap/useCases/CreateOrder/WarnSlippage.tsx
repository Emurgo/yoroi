import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../../ui/Button/Button'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {Spacer} from '../../../../ui/Space/Space'
import {useStrings} from '../../common/strings'

interface Props {
  onConfirm: () => void
  slippage: number
  ticker: string
}

export const WarnSlippage = ({onConfirm, slippage, ticker}: Props) => {
  const strings = useStrings()
  const {closeModal} = useModal()
  const {color} = useTheme()

  const slippageTolerance = `${slippage}%`
  const minReceived = `0 ${ticker}`

  return (
    <View
      style={[styles.container, a.flex_1, a.justify_between, a.px_lg, a.pb_lg]}
    >
      <Text style={[styles.description, {color: color.text_gray_medium}]}>
        {strings.slippageWarningText}
      </Text>

      <Spacer height={16} />

      <View style={[styles.table, a.flex_col, a.gap_sm]}>
        <View style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}>
          <Text style={[styles.label, {color: color.text_gray_medium}]}>
            {strings.slippageWarningYourSlippage}
          </Text>

          <View
            style={[
              styles.textWrapper,
              a.flex_row,
              a.justify_end,
              a.align_end,
              a.flex_1,
              a.flex_wrap,
              a.gap_xs,
            ]}
          >
            <Text style={[styles.value, {color: color.text_gray_max}]}>
              {slippageTolerance}
            </Text>
          </View>
        </View>

        <View style={[styles.row, a.flex_row, a.justify_between, a.gap_md]}>
          <Text style={[styles.label, {color: color.text_gray_medium}]}>
            {strings.swapMinReceivedTitle}
          </Text>

          <View
            style={[
              styles.textWrapper,
              a.flex_row,
              a.justify_end,
              a.align_end,
              a.flex_1,
              a.flex_wrap,
              a.gap_xs,
            ]}
          >
            <Text style={[styles.value, {color: color.text_gray_max}]}>
              {minReceived}
            </Text>
          </View>
        </View>
      </View>

      <Spacer fill />

      <View
        style={[
          styles.actions,
          a.align_center,
          a.justify_between,
          a.flex_row,
          a.gap_lg,
        ]}
      >
        <Button
          testID="swapCancelButton"
          size="S"
          type={ButtonType.Secondary}
          title={strings.limitPriceWarningBack}
          onPress={closeModal}
        />

        <Button
          testID="swapConfirmButton"
          size="S"
          title={strings.limitPriceWarningConfirm}
          onPress={onConfirm}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {},
  container: {},
  label: {
    ...a.body_1_lg_regular,
  },
  value: {
    ...a.body_1_lg_regular,
  },
  textWrapper: {},
  table: {},
  row: {},
  description: {
    ...a.body_1_lg_regular,
  },
})
