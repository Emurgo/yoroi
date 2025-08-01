import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {FormattedMetadata} from '~/features/ReviewTx/common/types'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

export const MetadataTab = ({metadata, hash}: FormattedMetadata) => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  if (hash == null || metadata == null) return null

  const metadataFormatted = JSON.stringify(metadata, null, 2)

  return (
    <View style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
          {strings.txReview.metadataHash}
        </Text>

        <Space.Width.lg />

        <Copiable style={[a.flex_1]} text={hash}>
          <Text
            style={[
              a.text_right,
              a.flex_1,
              a.body_2_md_regular,
              {color: p.text_gray_medium},
            ]}
          >
            {hash}
          </Text>
        </Copiable>
      </View>

      <Space.Height.lg />

      <View style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_lg]}>
        <View style={[a.flex_row, a.justify_between]}>
          <Copiable text={metadataFormatted}>
            <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
              {strings.txReview.metadataJsonLabel}
            </Text>
          </Copiable>
        </View>

        <Space.Height.lg />

        <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
          {metadataFormatted}
        </Text>
      </View>
    </View>
  )
}
