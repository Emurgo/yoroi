import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../components'
import {getPriceImpactStatus, usePriceImpactStatusTheme} from '../helpers'
import {useStrings} from '../strings'

type PriceImpactProps = {
  priceImpact: number
  actualPrice: number
  pair: string
}

export const PriceImpact = ({priceImpact, actualPrice, pair}: PriceImactProps) => {
  const strings = useStrings()
  const priceImpactRisk = getPriceImpactStatus(priceImpact)
  const priceImpactColor = usePriceImpactStatusTheme(priceImpactRisk ?? 'positive')
  const warningColorHex = priceImpactColor.text

  if (actualPrice === 0 || isNaN(actualPrice)) {
    return null
  }

  return (
    <View style={styles.priceImpactWrapper}>
      <View>
        {priceImpactRisk === 'warning' && <Icon.Info size={20} color={warningColorHex} />}

        {priceImpactRisk === 'negative' && <Icon.Warning size={20} color={warningColorHex} />}
      </View>

      <Text style={{color: warningColorHex}}>
        <Text>{strings.priceimpact}</Text>

        <Text> = </Text>

        <Text style={{paddingRight: 10}}>{Math.ceil(priceImpact * 100) / 100}%</Text>

        <Text> {`(${actualPrice} ${pair})`}</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  priceImpactWrapper: {
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
})
