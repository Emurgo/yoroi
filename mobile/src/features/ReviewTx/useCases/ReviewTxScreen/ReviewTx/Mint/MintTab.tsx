import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {TokenItem} from '~/features/ReviewTx/common/TokenItem'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

export const MintTab = ({mintData}: {mintData: FormattedTx['mint']}) => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      {mintData?.map(([info, count], index) => {
        const [policyId] = info.id.split('.')
        const countNum = BigInt(count)
        const isBurn = countNum < 0n
        const actionType = isBurn
          ? strings.txReview.mint.burnLabel
          : strings.txReview.mint.mintLabel
        const displayCount = isBurn ? count.slice(1) : count

        return (
          <View key={index}>
            <Space.Height.lg />

            <View style={[a.flex_row, a.justify_between, a.align_center]}>
              <Text
                style={[
                  a.body_2_md_medium,
                  {color: isBurn ? p.red_static : p.green_static},
                ]}
              >
                {actionType}
              </Text>
              <Text
                style={[a.body_2_md_regular, ta.text_gray_medium]}
              >{`${strings.txReview.policyIdLabel}:`}</Text>
            </View>

            <Space.Height.sm />

            <View style={[a.flex_1, a.flex_row, a.justify_between]}>
              <Copiable text={policyId!} style={a.flex_1}>
                <Text
                  style={[a.flex_1, a.body_2_md_regular, ta.text_gray_medium]}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {policyId}
                </Text>
              </Copiable>
            </View>

            <View style={[a.flex_1, a.flex_row, a.justify_end]}>
              <TokenItem
                key={index}
                tokenInfo={info}
                label={`${isBurn ? '-' : '+'}${displayCount} ${info.name}`}
                isPrimaryToken={false}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}
