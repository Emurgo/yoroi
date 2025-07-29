import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/ReviewTx/common/hooks/useStrings'
import {TokenItem} from '~/features/ReviewTx/common/TokenItem'
import {FormattedTx} from '~/features/ReviewTx/common/types'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

export const MintTab = ({mintData}: {mintData: FormattedTx['mint']}) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      {mintData?.map(([info, count], index) => {
        const [policyId] = info.id.split('.')

        return (
          <View key={index}>
            <Space.Height.lg />

            <View style={[a.flex_1, a.flex_row, a.justify_between]}>
              <Text
                style={[a.body_2_md_medium, {color: p.text_gray_medium}]}
              >{`${strings.policyIdLabel}:`}</Text>

              <Space.Width.sm />

              <Copiable text={policyId} style={[a.flex_1]}>
                <Text
                  style={[
                    a.flex_1,
                    a.body_2_md_regular,
                    {color: p.text_gray_medium},
                  ]}
                >
                  {policyId}
                </Text>
              </Copiable>
            </View>

            <View style={[a.flex_1, a.flex_row, a.justify_end]}>
              <TokenItem
                key={index}
                tokenInfo={info}
                label={`${count} ${info.name}`}
                isPrimaryToken={false}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}
