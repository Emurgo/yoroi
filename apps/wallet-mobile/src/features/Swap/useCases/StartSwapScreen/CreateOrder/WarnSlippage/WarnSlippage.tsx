import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {useStrings} from '../../../../common/strings'

export interface Props {
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
      <View>
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
  const {theme} = useTheme()
  const {color, typography} = theme
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
      color: color.gray_c600,
      lineHeight: 24,
      fontFamily: 'Rubik-Regular',
    },
    value: {
      fontSize: 16,
      color: color.gray_cmax,
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
    description: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c900,
    },
  })

  return styles
}
