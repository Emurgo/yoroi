import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const PortfolioTokenChartSkeleton = () => {
  const {color} = useStyles()
  return (
    <View style={{flex: 1}}>
      <SkeletonPlaceholder borderRadius={9} backgroundColor={color.gray_c100}>
        <SkeletonPlaceholder.Item height={214}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" justifyContent="space-between">
            <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" gap={2}>
              <SkeletonPlaceholder.Item width={64} height={22} />

              <SkeletonPlaceholder.Item width={64} height={22} />

              <SkeletonPlaceholder.Item width={16} height={16} />
            </SkeletonPlaceholder.Item>

            <SkeletonPlaceholder.Item width={64} height={22} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flex={1} marginVertical={16} height={112} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  return {color} as const
}
