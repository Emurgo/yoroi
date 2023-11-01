import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {useStrings} from '../../../../common/strings'

export interface Props {
  onClose?: () => void
  onSubmit?: () => void
  slippage: number
}

export const SlippageWarning = ({onSubmit, slippage}: Props) => {
  const strings = useStrings()
  const {closeModal} = useModal()

  const slippageTolerance = `${slippage}%`

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
          onPress={onSubmit}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </View>
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
  description: {
    fontFamily: 'Rubik',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: '#242838',
  },
})
