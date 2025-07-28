import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {Icon} from '~/ui/Icon'
import {Rate} from '~/ui/Rate/Rate'
import {Tooltip} from '~/ui/Tooltip/Tooltip'

type Props = {
  rate: number
  name: string
  hasDApps: boolean
}
export const BalanceHeaderCard = ({name, rate, hasDApps}: Props) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.justify_between, a.align_center]}>
      {hasDApps ? (
        <Tooltip numberOfLine={3} title={strings.totalPortfolioValueTooltip}>
          <View style={[a.flex_row, a.align_center, a.gap_xs]}>
            <Text style={[a.body_2_md_regular, {color: p.white_static}]}>
              {strings.totalPortfolioValue}
            </Text>

            <Icon.InfoCircle color={p.white_static} />
          </View>
        </Tooltip>
      ) : (
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <Text style={[a.body_2_md_regular, {color: p.white_static}]}>
            {strings.totalWalletValue}
          </Text>
        </View>
      )}

      <Rate rate={rate} name={name} />
    </View>
  )
}
