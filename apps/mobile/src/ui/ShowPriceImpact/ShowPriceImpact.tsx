import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {
  getPriceImpactRisk,
  usePriceImpactRiskTheme,
} from '~/features/Swap/common/helpers'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const ShowPriceImpact = ({priceImpact = 0}: {priceImpact?: number}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  const priceImpactRisk = getPriceImpactRisk(priceImpact)

  const priceImpactRiskTheme = usePriceImpactRiskTheme(priceImpactRisk)
  const textColor = priceImpactRiskTheme.text

  if (priceImpactRisk === 'none') return null

  const formattedPriceImpact = `${Math.ceil(priceImpact * 100) / 100}%`

  return (
    <View style={[a.flex, a.flex_row, a.gap_2xs]}>
      {priceImpactRisk === 'moderate' && (
        <Icon.Info size={20} color={textColor} />
      )}

      {priceImpactRisk === 'high' && (
        <Icon.Warning size={20} color={textColor} />
      )}

      <Text style={[{color: textColor}, a.body_2_md_regular]}>
        <Text>{strings.swap.priceImpact}</Text>

        <Text> = </Text>

        <Text style={{paddingRight: 10}}>{formattedPriceImpact}</Text>
      </Text>
    </View>
  )
}
