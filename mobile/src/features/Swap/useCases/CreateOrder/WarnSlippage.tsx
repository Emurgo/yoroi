import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'

type Props = {
  onConfirm: () => void
  slippage: number
  ticker: string
}

export const WarnSlippage = ({onConfirm, slippage, ticker}: Props) => {
  const strings = useStrings()
  const {closeModal} = useModal()
  const {atoms: ta} = useTheme()

  const slippageTolerance = `${slippage}%`
  const minReceived = `0 ${ticker}`

  return (
    <View style={[a.flex_1, a.justify_between, a.px_lg, a.pb_lg]}>
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.swap.slippageWarningText}
      </Text>

      <Space.Height.md />

      <View style={[a.flex_col, a.gap_sm]}>
        <View style={[a.flex_row, a.justify_between, a.gap_md]}>
          <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
            {strings.swap.slippageWarningYourSlippage}
          </Text>

          <View
            style={[
              a.flex_row,
              a.justify_end,
              a.align_end,
              a.flex_1,
              a.flex_wrap,
              a.gap_xs,
            ]}
          >
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {slippageTolerance}
            </Text>
          </View>
        </View>

        <View style={[a.flex_row, a.justify_between, a.gap_md]}>
          <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
            {strings.swap.swapMinReceivedTitle}
          </Text>

          <View
            style={[
              a.flex_row,
              a.justify_end,
              a.align_end,
              a.flex_1,
              a.flex_wrap,
              a.gap_xs,
            ]}
          >
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {minReceived}
            </Text>
          </View>
        </View>
      </View>

      <View style={a.flex_1} />

      <View style={[a.align_center, a.justify_between, a.flex_row, a.gap_lg]}>
        <Button
          testID="swapCancelButton"
          size="S"
          type={ButtonType.Secondary}
          title={strings.swap.limitPriceWarningBack}
          onPress={closeModal}
        />

        <Button
          testID="swapConfirmButton"
          size="S"
          title={strings.swap.limitPriceWarningConfirm}
          onPress={onConfirm}
        />
      </View>
    </View>
  )
}
