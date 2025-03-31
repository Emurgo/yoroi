import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../common/helpers'
import {useStrings} from '../../common/strings'

export const ShowPriceImpact = ({priceImpact = 0}: {priceImpact?: number}) => {
  const strings = useStrings()
  const styles = useStyles()

  const priceImpactRisk = getPriceImpactRisk(priceImpact)

  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const textColor = priceImpactRiskTheme.text

  if (priceImpactRisk === 'none') return null

  const formattedPriceImpact = `${Math.ceil(priceImpact * 100) / 100}%`

  return (
    <View style={styles.row}>
      {priceImpactRisk === 'moderate' && <Icon.Info size={20} color={textColor} />}

      {priceImpactRisk === 'high' && <Icon.Warning size={20} color={textColor} />}

      <Text style={[{color: textColor}, styles.text]}>
        <Text>{strings.priceImpact}</Text>

        <Text> = </Text>

        <Text style={{paddingRight: 10}}>{formattedPriceImpact}</Text>
      </Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    row: {
      ...atoms.flex,
      ...atoms.flex_row,
      ...atoms.gap_2xs,
    },
    text: {
      ...atoms.body_2_md_regular,
    },
  })
  return styles
}
