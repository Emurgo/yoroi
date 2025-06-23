import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const PortfolioTokenDetailBalanceSkeleton = () => {
  const {color} = useStyles()
  return (
    <View>
      <SkeletonPlaceholder borderRadius={9} backgroundColor={color.gray_100}>
        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={140} height={36} />

          <SkeletonPlaceholder.Item marginTop={2} width={82} height={22} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()
  return {color} as const
}
