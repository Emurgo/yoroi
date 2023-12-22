import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../components'
import {getPriceImpactRisk, usePriceImpactRiskTheme} from '../helpers'
import {useStrings} from '../strings'

type PriceImpactProps = {
  priceImpact: number
  actualPrice: number
  pair: string
}

export const PriceImpact = ({priceImpact, actualPrice, pair}: PriceImpactProps) => {
  const strings = useStrings()
  const priceImpactRisk = getPriceImpactRisk(priceImpact)
  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const textColor = priceImpactRiskTheme.text

  if (priceImpactRisk === 'none' || actualPrice === 0 || isNaN(actualPrice)) {
    return null
  }

  const formattedPriceImpact = `${Math.ceil(priceImpact * 100) / 100}% `
  const actualPricePair = `(${actualPrice} ${pair})`

  return (
    <View style={styles.row}>
      <View>
        {priceImpactRisk === 'moderate' && <Icon.Info size={20} color={textColor} />}

        {priceImpactRisk === 'high' && <Icon.Warning size={20} color={textColor} />}
      </View>

      <Text style={{color: textColor}}>
        <Text>{strings.priceImpact}</Text>

        <Text> = </Text>

        <Text style={{paddingRight: 10}}>{formattedPriceImpact}</Text>

        <Text>{actualPricePair}</Text>
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
    alignItems: 'center',
  },
})
