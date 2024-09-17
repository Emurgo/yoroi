import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../../../components/Button/Button'
import {useModal} from '../../../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {useStrings} from '../../../../common/strings'

interface Props {
  onConfirm: () => void
  slippage: number
  ticker: string
}

export const WarnSlippage = ({onConfirm, slippage, ticker}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const {closeModal} = useModal()

  const slippageTolerance = `${slippage}%`
  const minReceived = `0 ${ticker}`

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{strings.slippageWarningText}</Text>

      <Spacer height={16} />

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.label}>{strings.slippageWarningYourSlippage}</Text>

          <View style={styles.textWrapper}>
            <Text style={styles.value}>{slippageTolerance}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{strings.swapMinReceivedTitle}</Text>

          <View style={styles.textWrapper}>
            <Text style={styles.value}>{minReceived}</Text>
          </View>
        </View>
      </View>

      <Spacer fill />

      <View style={styles.actions}>
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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    buttonContainer: {
      ...atoms.flex_1,
    },
    actions: {
      ...atoms.align_center,
      ...atoms.justify_between,
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.justify_between,
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
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.align_end,
      ...atoms.flex_1,
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
