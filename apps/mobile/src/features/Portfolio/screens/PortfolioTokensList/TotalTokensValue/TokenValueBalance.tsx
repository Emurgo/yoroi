import {amountBreakdown, infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useCurrencyPairing} from '~/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext'
import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {SkeletonPrimaryToken} from './SkeletonPrimaryToken'

type Props = {
  amount: Portfolio.Token.Amount
  isFetching: boolean
  isPrimaryTokenActive: boolean
  rate?: number
}
export const TokenValueBalance = ({
  amount,
  isFetching,
  isPrimaryTokenActive,
  rate,
}: Props) => {
  const {atoms: ta, palette: p} = useTheme()
  const {currency, config} = useCurrencyPairing()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const name = infoExtractName(amount.info)

  return (
    <View style={[a.flex_row, a.gap_2xs, a.align_baseline]}>
      {isFetching || rate === undefined ? (
        <SkeletonPrimaryToken />
      ) : (
        <Text
          style={[
            a.heading_1_medium,
            a.font_semibold,
            {color: p.text_gray_medium},
          ]}
        >
          {isPrivacyActive
            ? privacyPlaceholder
            : isPrimaryTokenActive
              ? amountBreakdown(amount).bn.toFormat(2)
              : amountBreakdown(amount)
                  .bn.times(rate)
                  .toFormat(config.decimals)}
        </Text>
      )}

      <Text
        style={[
          a.body_1_lg_medium,
          a.font_semibold,
          {color: p.text_gray_medium},
        ]}
      >
        {isPrimaryTokenActive ? name : currency}
      </Text>
    </View>
  )
}
