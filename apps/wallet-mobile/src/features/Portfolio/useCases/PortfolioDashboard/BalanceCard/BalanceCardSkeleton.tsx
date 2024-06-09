import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const BalanceCardSkeleton = () => {
  const {color} = useTheme()
  return (
    <SkeletonPlaceholder borderRadius={9} backgroundColor={color.gray_c100}>
      <SkeletonPlaceholder.Item width="100%" height={122} />
    </SkeletonPlaceholder>
  )
}
