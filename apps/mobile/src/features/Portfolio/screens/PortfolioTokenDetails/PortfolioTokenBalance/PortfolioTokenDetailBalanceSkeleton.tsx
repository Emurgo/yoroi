import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const PortfolioTokenDetailBalanceSkeleton = () => {
  const {atoms: ta, palette: p} = useTheme()
  return (
    <View>
      <SkeletonPlaceholder borderRadius={9} backgroundColor={p.gray_100}>
        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={140} height={36} />

          <SkeletonPlaceholder.Item marginTop={2} width={82} height={22} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  )
}
