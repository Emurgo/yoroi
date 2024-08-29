import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, Spacer, useModal} from '../../../../../../components'
import {PRICE_IMPACT_HIGH_RISK, PRICE_IMPACT_MODERATE_RISK} from '../../../../common/constants'
import {useStrings} from '../../../../common/strings'
import {SwapPriceImpactRisk} from '../../../../common/types'

export interface Props {
  onContinue: () => void
  priceImpactRisk: SwapPriceImpactRisk
}

export const WarnPriceImpact = ({onContinue, priceImpactRisk}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const {closeModal} = useModal()

  if (priceImpactRisk === 'none') return null

  return (
    <View style={styles.root}>
      <Text style={styles.description}>
        <Text style={styles.bold}>
          {strings.priceImpactRiskHigh({
            riskValue: priceImpactRisk === 'moderate' ? PRICE_IMPACT_MODERATE_RISK : PRICE_IMPACT_HIGH_RISK,
          })}
        </Text>

        <Text> {strings.priceImpactDescription(priceImpactRisk)}</Text>
      </Text>

      <Spacer fill />

      <View style={styles.buttonsWrapper}>
        <Button outlineShelley title={strings.cancel} onPress={closeModal} containerStyle={styles.buttonContainer} />

        <Button
          title={strings.continue}
          onPress={onContinue}
          style={styles.buttonContinue}
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
    buttonContinue: {
      backgroundColor: color.sys_magenta_500,
      ...atoms.flex_1,
    },
    buttonsWrapper: {
      ...atoms.gap_lg,
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.justify_between,
    },
    root: {
      ...atoms.justify_between,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    description: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    bold: {
      ...atoms.body_1_lg_medium,
    },
  })
  return styles
}
