import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../../../components'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../../../../common/helpers'
import {useStrings} from '../../../../common/strings'

type PriceImpactProps = {
  priceImpact: number
  formattedPrice: string
  pair: string
}

export const ShowPriceImpact = ({priceImpact, formattedPrice, pair}: PriceImpactProps) => {
  const strings = useStrings()
  const priceImpactRisk = getPriceImpactRisk(priceImpact)

  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const textColor = priceImpactRiskTheme.text

  if (priceImpactRisk === 'none') return null

  const formattedPriceImpact = `${Math.ceil(priceImpact * 100) / 100}%`
  const formattedPricePair = `(${formattedPrice} ${pair})`

  return (
    <View style={styles.row}>
      {priceImpactRisk === 'moderate' && <Icon.Info size={20} color={textColor} />}

      {priceImpactRisk === 'high' && <Icon.Warning size={20} color={textColor} />}

      <Text style={[{color: textColor}, styles.textContent]}>
        <Text>{strings.priceImpact}</Text>

        <Text> = </Text>

        <Text style={{paddingRight: 10}}>{formattedPriceImpact}</Text>

        <Text> {formattedPricePair}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-start',
  },
  textContent: {
    flexWrap: 'wrap',
    flex: 1,
    textAlign: 'left',
    lineHeight: 20,
  },
})
