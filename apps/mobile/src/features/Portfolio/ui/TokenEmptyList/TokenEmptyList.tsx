import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {AssetTokenImage} from '~/ui/AssetTokenImage/AssetTokenImage'

type Props = {
  emptyText?: string
}

export const TokenEmptyList = ({emptyText}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View
      style={[
        a.flex_col,
        a.justify_center,
        a.align_center,
        a.w_full,
        a.gap_lg,
        a.flex_1,
      ]}
    >
      <View
        style={[{width: 280, height: 280}, a.justify_center, a.align_center]}
      >
        <AssetTokenImage />
      </View>

      <Text style={[{color: p.gray_max}, a.heading_3_medium, a.font_semibold]}>
        {emptyText ?? strings.noTokensFound}
      </Text>
    </View>
  )
}
