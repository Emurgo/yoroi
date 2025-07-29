import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {ChartPlaceholder} from './ChartPlaceholder'

export const PortfolioTokenChartSkeleton = () => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View style={[a.flex_col]}>
      <View style={[a.flex_row, a.justify_between, a.align_center]}>
        <View
          style={[
            {width: 128},
            a.flex_row,
            a.justify_start,
            a.align_center,
            a.gap_2xs,
          ]}
        >
          <SkeletonPlaceholder borderRadius={20} backgroundColor={p.gray_100}>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              gap={2}
            >
              <SkeletonPlaceholder.Item width={48} height={24} />

              <SkeletonPlaceholder.Item width={64} height={24} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>

        <SkeletonPlaceholder borderRadius={20} backgroundColor={p.gray_100}>
          <SkeletonPlaceholder.Item width={64} height={16} />
        </SkeletonPlaceholder>
      </View>

      <ChartPlaceholder />
    </View>
  )
}
