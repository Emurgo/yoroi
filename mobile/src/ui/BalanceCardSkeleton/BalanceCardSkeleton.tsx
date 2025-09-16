import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const BalanceCardSkeleton = () => {
  const {atoms: ta} = useTheme()
  return (
    <View style={[a.overflow_hidden]}>
      <SkeletonPlaceholder
        key="u"
        shimmerWidth={300}
        speed={2000}
        borderRadius={9}
        highlightColor={ta.el_gray_max.color}
        backgroundColor={ta.bg_color_min.backgroundColor}
      >
        <SkeletonPlaceholder.Item height={122} borderRadius={9} />
      </SkeletonPlaceholder>
    </View>
  )
}
