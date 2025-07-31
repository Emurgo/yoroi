import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

export const BalanceCardSkeleton = () => {
  const {palette: p} = useTheme()
  return (
    <SkeletonPlaceholder borderRadius={9} backgroundColor={p.gray_100}>
      <SkeletonPlaceholder.Item width="100%" height={122} />
    </SkeletonPlaceholder>
  )
}
