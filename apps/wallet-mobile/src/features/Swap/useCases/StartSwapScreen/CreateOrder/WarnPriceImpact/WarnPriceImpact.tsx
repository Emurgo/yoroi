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
    <View style={styles.container}>
      <View>
        <Text style={styles.description}>
          <Text style={styles.bold}>
            {strings.priceImpactRiskHigh({
              riskValue: priceImpactRisk === 'moderate' ? PRICE_IMPACT_MODERATE_RISK : PRICE_IMPACT_HIGH_RISK,
            })}
          </Text>

          <Text> {strings.priceImpactDescription(priceImpactRisk)}</Text>
        </Text>
      </View>

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
    buttonContinue: {
      flex: 1,
      backgroundColor: color.sys_magenta_c500,
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
    description: {
      color: color.gray_c900,
      ...atoms.body_1_lg_regular,
      lineHeight: 21,
    },
    bold: {
      ...atoms.body_1_lg_medium,
    },
  })
  return styles
}
